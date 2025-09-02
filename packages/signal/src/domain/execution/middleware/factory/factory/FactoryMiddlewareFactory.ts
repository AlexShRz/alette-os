import { EventBusListener } from "@alette/event-sourcing";
import { EventBusListenerTag, IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { RequestMiddleware } from "../../../../middleware/RequestMiddleware";
import { AggregateRequestMiddleware } from "../../../events/AggregateRequestMiddleware";

export class FactoryMiddlewareFactory extends E.Service<EventBusListener>()(
	EventBusListenerTag,
	{
		scoped: E.fn(function* (getMiddleware: () => RequestMiddleware) {
			const { base, context } = yield* EventBusListener.parent();

			return {
				...base,
				send(event) {
					return E.gen(this, function* () {
						if (event instanceof AggregateRequestMiddleware) {
							event.addMiddleware(getMiddleware());
						}

						return yield* context.next(event);
					});
				},
			} satisfies IEventBusListener;
		}),
	},
) {}
