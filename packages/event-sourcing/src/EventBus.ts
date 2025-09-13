import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { v4 as uuid } from "uuid";
import { BusEvent } from "./events/BusEvent.js";
import {
	EventBusListener,
	EventBusListenerFactory,
	IEventBusListenerContext,
} from "./listeners";
import { EventBusPipelineBuilder, ILastEventExtractor } from "./pipeline";

export class EventBus extends E.Service<EventBus>()("EventBus", {
	dependencies: [EventBusPipelineBuilder.Default],
	scoped: <A extends EventBusListener = EventBusListener>(
		providedListeners: EventBusListenerFactory<string, A>[],
	) =>
		E.gen(function* () {
			const id = uuid();
			const pipelineBuilder = yield* EventBusPipelineBuilder;
			const pipeline = yield* SynchronizedRef.make<
				IEventBusListenerContext["next"] | null
			>(null);

			const getPipelineOrThrow = pipeline.get.pipe(
				E.andThen(
					E.fn(function* (current) {
						if (!current) {
							return yield* E.dieMessage("No constructed pipeline found.");
						}

						return current;
					}),
				),
			);

			const createOrGetPipeline = (getSelf: () => EventBus) =>
				SynchronizedRef.getAndUpdateEffect(pipeline, (currentPipeline) =>
					E.gen(function* () {
						if (currentPipeline) {
							return currentPipeline;
						}

						return yield* pipelineBuilder.create(
							providedListeners as EventBusListenerFactory[],
							getSelf,
						);
					}),
				).pipe(E.andThen(() => getPipelineOrThrow));

			return {
				getId() {
					return id;
				},

				broadcast(extractor: ILastEventExtractor) {
					return pipelineBuilder.setLastEventExtractor(extractor);
				},

				send<T extends BusEvent>(event: T) {
					return E.gen(this, function* () {
						const currentPipeline = yield* createOrGetPipeline(
							() => this as EventBus,
						);
						return yield* currentPipeline(event);
					});
				},
			};
		}),
}) {
	static makeAsValue<A extends EventBus, I, R>(layer: Layer.Layer<A, I, R>) {
		return E.gen(function* () {
			const context = yield* Layer.build(layer);
			return Context.unsafeGet(context, EventBus);
		});
	}
}
