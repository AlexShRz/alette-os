import { Array } from "effect";
import {
	Effect,
	all,
	ensuring,
	gen,
	orDieWith,
	unsafeMakeLatch,
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

export class EventBus {
	protected id = uuid();
	protected isShutdown = false;
	protected latch = unsafeMakeLatch(true);
	protected pipelineBuilder = new EventBusPipelineBuilder();

	protected listeners = Array.empty<BusEventListener>();
	protected pipeline: ConstructedPipeline | null = null;

	getId() {
		return this.id;
	}

	send(event: BusEvent) {
		return gen(this, function* () {
			if (this.isShutdown) {
				return yield* CannotSendEventsToShutdownBusError.make();
			}

			if (this.pipeline) {
				return yield* this.pipeline(event);
			}

			this.pipeline = this.pipelineBuilder.create(
				this.listeners,
				() => this as EventBus,
			);
			return yield* this.pipeline(event);
		}).pipe(this.latch.whenOpen);
	}

	protected sortListeners(listeners: BusEventListener[]) {
		return listeners.sort((a, b) => a.getPriority() - b.getPriority());
	}

	with(
		provider: (
			prevListeners: BusEventListener[],
		) => Effect<BusEventListener[], unknown, never>,
	) {
		return gen(this, function* () {
			yield* this.latch.close;
			const prevListeners = this.listeners;
			const unfilteredNewListeners = yield* provider(prevListeners);

			const alreadyActiveListeners = Array.intersectionWith<BusEventListener>(
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
			this.listeners = this.sortListeners([...this.listeners, ...newListeners]);
			this.pipeline = this.pipelineBuilder.create(
				this.listeners,
				() => this as EventBus,
			);
			/**
			 * Run listener setup and cleanup
			 * */
			yield* all(
				newListeners.map((l) => l.initialize()),
				{ concurrency: "unbounded" },
			);
			yield* this.shutdownListeners(removedPrevListeners);

			return this;
		}).pipe(ensuring(this.latch.open));
	}

	takeAfter(extractor: LastPipelineEventExtractor) {
		this.pipelineBuilder.setLastEventExtractor(extractor);
		return this;
	}

	protected shutdownListeners(listeners: BusEventListener[]) {
		return all(
			/**
			 * Shutdown listeners in reverse and in sequence
			 * from last to newest
			 * */
			[...listeners]
				.reverse()
				.map((l) => l.shutdown()),
		);
	}

	shutdown() {
		return gen(this, function* () {
			yield* this.shutdownListeners(this.listeners);

			this.listeners = [];
			this.isShutdown = true;
			return this.latch.open;
		}).pipe(
			orDieWith((error) =>
				CannotShutdownEventBusListenersError.make({ error }),
			),
		);
	}
}
