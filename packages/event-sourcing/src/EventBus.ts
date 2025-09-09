import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
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
			let pipeline: IEventBusListenerContext["next"] | null = null;

			return {
				getId() {
					return id;
				},

				broadcast(extractor: ILastEventExtractor) {
					return pipelineBuilder.setLastEventExtractor(extractor);
				},

				send<T extends BusEvent>(event: T) {
					return E.gen(this, function* () {
						if (pipeline) {
							return yield* pipeline(event);
						}

						pipeline = yield* pipelineBuilder.create(
							providedListeners as EventBusListenerFactory[],
							() => this as EventBus,
						);
						return yield* pipeline(event);
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
