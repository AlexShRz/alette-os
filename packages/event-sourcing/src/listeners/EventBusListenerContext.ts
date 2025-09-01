import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { BusEvent } from "../events/BusEvent.js";

export interface IEventBusListenerContext {
	sendToBus<T extends BusEvent>(event: T): E.Effect<BusEvent, never, never>;
	next<T extends BusEvent>(event: T): E.Effect<BusEvent, never, never>;
}

export class EventBusListenerContext extends E.Service<EventBusListenerContext>()(
	"EventBusListenerContext",
	{
		accessors: true,
		effect: E.gen(function* () {
			let toEventBus: IEventBusListenerContext["sendToBus"] | null = null;
			let toNext: IEventBusListenerContext["next"] | null = null;

			return {
				sendToBus(event: BusEvent) {
					return E.gen(function* () {
						if (!toEventBus) {
							return yield* E.dieMessage(
								"Event bus dispatcher was not provided to listener context.",
							);
						}

						return yield* toEventBus(event);
					});
				},
				next(event: BusEvent) {
					return E.gen(function* () {
						if (!toNext) {
							return yield* E.dieMessage(
								"Next event listener in chain was not provided to listener context.",
							);
						}

						return yield* toNext(event);
					});
				},
				setEventBusDispatcher(
					providedEventBusDispatcher: IEventBusListenerContext["sendToBus"],
				) {
					toEventBus = providedEventBusDispatcher;
					return this;
				},
				setNext(providedToNextDispatcher: IEventBusListenerContext["next"]) {
					toNext = providedToNextDispatcher;
					return this;
				},
			};
		}),
	},
) {
	static makeAsValue() {
		return E.gen(function* () {
			const context = yield* Layer.build(EventBusListenerContext.Default);
			return Context.unsafeGet(context, EventBusListenerContext);
		});
	}
}
