import { EventBusListener } from "@alette/event-sourcing";
import {
	EventBusListenerContext,
	EventBusListenerTag,
	IEventBusListener,
} from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { InputMiddleware } from "./InputMiddleware";

export class InputMiddlewareInjector extends E.Service<EventBusListener>()(
	EventBusListenerTag,
	{
		dependencies: [EventBusListenerContext.Default],
		effect: E.fn(function* (getMiddleware: typeof InputMiddleware.Default) {
			const { base, context } = yield* EventBusListener.parent();

			return {
				...base,
				send(e) {
					return E.gen(this, function* () {
						return yield* context.next(e);
					});
				},
			} satisfies IEventBusListener;
		}),
	},
) {}
