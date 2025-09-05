import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Scope from "effect/Scope";
import { EventBus } from "../EventBus.js";
import { BusEvent } from "../events/BusEvent.js";
import {
	EventBusListener,
	EventBusListenerFactory,
	IEventBusListenerContext,
} from "../listeners";
import { EventInterceptor } from "./EventInterceptor.js";

type ConstructedPipeline = IEventBusListenerContext["next"];

interface IEventBusSupplier {
	(): EventBus;
}

export interface ILastEventExtractor {
	(event: BusEvent): E.Effect<void>;
}

export class EventBusPipelineBuilder extends E.Service<EventBusPipelineBuilder>()(
	"EventBusPipelineBuilder",
	{
		scoped: E.gen(function* () {
			const scope = yield* E.scope;
			const pipelineContext = yield* E.context<never>();
			let lastEventBusEventExtractor: ILastEventExtractor = () => E.void;

			const lastListenerInChain = E.fn(function* (event: BusEvent) {
				/**
				 * Make sure last event extractor does not interfere
				 * with the chain and our event is returned EVEN IF
				 * the last event extractor returns null or something else.
				 * */
				yield* lastEventBusEventExtractor(event);
				return event;
			});

			/**
			 * Make sure to bind service context using E.provide(pipelineContext)
			 * */
			const createListener = (factory: EventBusListenerFactory) =>
				E.gen(function* () {
					const listenerContext = yield* Layer.build(factory.toLayer());
					const listener = Context.unsafeGet(listenerContext, EventBusListener);

					return {
						listenerContext: listener.getContext(),
						listener,
					};
				}).pipe(E.provide(pipelineContext));

			const createFlow = (
				eventBus: EventBus,
				listenerFactories: EventBusListenerFactory[],
				currentListenerIndex = 0,
			): E.Effect<ConstructedPipeline> =>
				E.gen(function* () {
					const currentListenerFactory =
						listenerFactories[currentListenerIndex];

					if (!currentListenerFactory) {
						return lastListenerInChain;
					}

					/**
					 * 1. Create current listener using
					 * a provided listener factory
					 * 2. Make sure to provide service context when running
					 * this effect.
					 * */
					const {
						listenerContext: currentListenerContext,
						listener: currentListener,
					} = yield* createListener(currentListenerFactory);

					const nextFactoryIndex = currentListenerIndex + 1;
					const nextListenerFactory = listenerFactories[nextFactoryIndex];

					/**
					 * DO NOT create this listener in the function below,
					 * otherwise it will be recreated each time we send
					 * an event to the bus.
					 * */
					const nextListener = yield* E.gen(function* () {
						if (!nextListenerFactory) {
							return lastListenerInChain;
						}

						return yield* createFlow(
							eventBus,
							listenerFactories,
							nextFactoryIndex,
						);
					});

					return E.fn(function* (event: BusEvent) {
						const isNonReceivableCancelledEvent =
							event.isCancelled() &&
							!currentListenerFactory.canReceiveCancelled();
						const isNonReceivableCompletedEvent =
							event.isCompleted() &&
							!currentListenerFactory.canReceiveCompleted();
						const isNonReceivableEventSentByItself =
							event.getDispatchedBy() === currentListener.getId() &&
							!currentListenerFactory.canReceiveEventsSentBySelf();

						/**
						 * 1. Get next listener in chain and configure
						 * current listener context
						 * 2. This needs to be done BEFORE sending the event
						 * to next listener.
						 * */
						currentListenerContext
							.setEventBusDispatcher((event) =>
								eventBus
									.send(event.setDispatchedBy(currentListener.getId()))
									.pipe(Scope.extend(scope)),
							)
							.setNext((e) =>
								E.gen(function* () {
									const interceptor = Context.getOption(
										pipelineContext,
										EventInterceptor,
									);

									/**
									 * Apply event interceptor if available
									 * */
									if (Option.isSome(interceptor)) {
										return yield* interceptor
											.value(e)
											.pipe(E.andThen(nextListener));
									}

									return yield* nextListener(e);
								}),
							);

						/**
						 * If our event listener CANNOT process the event
						 * for some reason - get next listener in chain and
						 * delegate to it.
						 * */
						if (
							isNonReceivableCancelledEvent ||
							isNonReceivableCompletedEvent ||
							isNonReceivableEventSentByItself
						) {
							return yield* nextListener(event);
						}

						return yield* currentListener.send(event);
					});
				}).pipe(Scope.extend(scope));

			const sortListenerFactories = (listeners: EventBusListenerFactory[]) => {
				return listeners.sort((a, b) => a.getPriority() - b.getPriority());
			};

			return {
				create(
					listenerFactories: EventBusListenerFactory[],
					getEventBus: IEventBusSupplier,
				) {
					return createFlow(
						getEventBus(),
						sortListenerFactories(listenerFactories),
					);
				},
				setLastEventExtractor(extractor: typeof lastEventBusEventExtractor) {
					lastEventBusEventExtractor = extractor;
					return this as EventBusPipelineBuilder;
				},
			};
		}),
	},
) {}
