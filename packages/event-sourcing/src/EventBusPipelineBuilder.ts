import { Effect, Service, gen, succeed } from "effect/Effect";
import { EventBus } from "./EventBus.js";
import { BusEvent } from "./events/BusEvent.js";
import { BusEventListener } from "./listeners/BusEventListener.js";
import { wasEventCancelled } from "./utils/eventCancellationUtils.js";

export interface ConstructedPipeline {
	(event: BusEvent): Effect<BusEvent, unknown, never>;
}

export interface LastPipelineEventExtractor {
	(lastReceivedEventInChain: BusEvent): Effect<void, unknown, never>;
}

interface EventBusSupplier {
	(): EventBus;
}

export class EventBusPipelineBuilder extends Service<EventBusPipelineBuilder>()(
	"EventBusPipelineBuilder",
	{
		accessors: true,
		effect: gen(function* () {
			let lastEventExtractor: ConstructedPipeline = (event) => succeed(event);

			/**
			 * Make sure that if we change the last event extractor, we
			 * always get our changed fn back
			 * */
			const getLastInChain: ConstructedPipeline = (event) =>
				gen(function* () {
					/**
					 * Make sure last event extractor does not interfere
					 * with the chain and our event is returned EVEN IF
					 * the last event extractor returns null or something else.
					 * */
					yield* lastEventExtractor(event);
					return event;
				});

			const createFlow = (
				eventBus: EventBus,
				listeners: BusEventListener[],
				currentListenerIndex = 0,
			): ConstructedPipeline => {
				const currentListener = listeners[currentListenerIndex];

				if (!currentListener) {
					return getLastInChain;
				}

				const nextListener = listeners[currentListenerIndex + 1];

				return (event) => {
					const nextInChain = !nextListener
						? getLastInChain
						: createFlow(eventBus, listeners, currentListenerIndex + 1);

					const isNonReceivableCancelledEvent =
						wasEventCancelled(event) && !currentListener.canReceiveCancelled();
					const isNonReceivableEventSentByItself =
						event.isDispatchedBy(currentListener) &&
						!currentListener.canReceiveEventsSentBySelf();

					if (
						isNonReceivableCancelledEvent ||
						isNonReceivableEventSentByItself
					) {
						return nextInChain(event);
					}

					return currentListener
						.bindContext({
							sendToEventBus: (event) =>
								eventBus.send(event.setDispatchedBy(currentListener.getId())),
							next: nextInChain,
						})
						.send(event);
				};
			};

			return {
				create(listeners: BusEventListener[], getEventBus: EventBusSupplier) {
					return createFlow(getEventBus(), listeners);
				},
				setLastEventExtractor(extractor: LastPipelineEventExtractor) {
					lastEventExtractor = extractor as ConstructedPipeline;
					return this;
				},
			};
		}),
	},
) {
	static Live = EventBusPipelineBuilder.Default;
}
