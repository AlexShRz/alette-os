import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { v4 as uuid } from "uuid";
import { BusEvent } from "./events/BusEvent.js";
import { EventBusListener } from "./listeners/EventBusListener.js";
import { IEventBusListenerContext } from "./listeners/EventBusListenerContext.js";
import { EventBusListenerFactory } from "./listeners/EventBusListenerFactory.js";
import {
	EventBusPipelineBuilder,
	ILastEventExtractor,
} from "./pipeline/EventBusPipelineBuilder.js";

export class EventBus extends E.Service<EventBus>()("EventBus", {
	dependencies: [EventBusPipelineBuilder.Default],
	scoped: <A extends EventBusListener = EventBusListener, R = never>(
		providedListeners: EventBusListenerFactory<A, R>[],
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

				send(event: BusEvent) {
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
