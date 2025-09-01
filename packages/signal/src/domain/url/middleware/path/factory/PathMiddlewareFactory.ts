import { EventBusListener } from "@alette/event-sourcing";
import { EventBusListenerTag, IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { AggregateRequestMiddleware } from "../../../../execution/events/AggregateRequestMiddleware";
import { RequestMiddleware } from "../../../../middleware/RequestMiddleware";

export class PathMiddlewareFactory extends E.Service<EventBusListener>()(
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
