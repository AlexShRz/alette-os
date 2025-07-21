import { Array } from "effect";
import {
	Effect,
	Service,
	addFinalizer,
	all,
	ensuring,
	gen,
	makeLatch,
	orDieWith,
} from "effect/Effect";
import { v4 as uuid } from "uuid";
import {
	ConstructedPipeline,
	EventBusPipelineBuilder,
	LastPipelineEventExtractor,
} from "./EventBusPipelineBuilder.js";
import { CannotSendEventsToShutdownBusError } from "./errors/CannotSendEventsToShutdownBusError.js";
import { CannotShutdownEventBusListenersError } from "./errors/CannotShutdownEventBusListenersError.js";
import { BusEvent } from "./events/BusEvent.js";
import { BusEventListener } from "./listeners/BusEventListener.js";

export class EventBus extends Service<EventBus>()("EventBus", {
	dependencies: [EventBusPipelineBuilder.Live],
	effect: gen(function* () {
		const id = uuid();
		let isShutdown = false;
		const latch = yield* makeLatch(true);
		const pipelineBuilder = yield* EventBusPipelineBuilder;

		let listeners = Array.empty<BusEventListener>();
		let pipeline: ConstructedPipeline | null = null;

		yield* addFinalizer(() =>
			gen(function* () {
				yield* all(
					listeners.map((l) => l.shutdown()),
					{ concurrency: "unbounded" },
				);

				listeners = [];
				isShutdown = true;
				return latch.open;
			}).pipe(
				orDieWith((error) =>
					CannotShutdownEventBusListenersError.make({ error }),
				),
			),
		);

		const sortListeners = (listeners: BusEventListener[]) =>
			listeners.sort((a, b) => a.getPriority() - b.getPriority());

		return {
			getId() {
				return id;
			},
			send(event: BusEvent) {
				return gen(this, function* () {
					if (isShutdown) {
						return yield* CannotSendEventsToShutdownBusError.make();
					}

					if (pipeline) {
						return yield* pipeline(event);
					}

					pipeline = pipelineBuilder.create(listeners, () => this as EventBus);
					return yield* pipeline(event);
				}).pipe(latch.whenOpen);
			},
			with(
				provider: (
					prevListeners: BusEventListener[],
				) => Effect<BusEventListener[], unknown, never>,
			) {
				return gen(this, function* () {
					yield* latch.close;
					const prevListeners = listeners;
					const unfilteredNewListeners = yield* provider(prevListeners);

					const alreadyActiveListeners =
						Array.intersectionWith<BusEventListener>(
							(oldListener, newListener) =>
								oldListener.getId() === newListener.getId(),
						)(prevListeners)(unfilteredNewListeners).map((l) => l.getId());

					const newListeners = unfilteredNewListeners.filter(
						(l) => !alreadyActiveListeners.includes(l.getId()),
					);
					const newListenerIds = newListeners.map((l) => l.getId());

					const removedPrevListeners = prevListeners.filter(
						(prevListener) => !newListenerIds.includes(prevListener.getId()),
					);

					/**
					 * Update listeners and recreate the pipeline
					 * */
					listeners = sortListeners([...listeners, ...newListeners]);
					pipeline = pipelineBuilder.create(listeners, () => this as EventBus);
					/**
					 * Run listener setup and cleanup
					 * */
					yield* all(
						newListeners.map((l) => l.initialize()),
						{ concurrency: "unbounded" },
					);
					yield* all(
						removedPrevListeners.map((l) => l.shutdown()),
						{ concurrency: "unbounded" },
					);

					return this;
				}).pipe(ensuring(latch.open));
			},
			takeAfter(extractor: LastPipelineEventExtractor) {
				pipelineBuilder.setLastEventExtractor(extractor);
				return this;
			},
		};
	}),
}) {
	static Live = EventBus.Default;
}
