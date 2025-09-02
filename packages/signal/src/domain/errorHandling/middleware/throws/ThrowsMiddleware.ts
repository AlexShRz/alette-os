import { EventBusListener } from "@alette/event-sourcing";
import { EventBusListenerTag, IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { IRecoverableApiError } from "./RequestRecoverableErrors";

export class ThrowsMiddleware extends E.Service<EventBusListener>()(
	EventBusListenerTag,
	{
		scoped: (recoverableErrors: IRecoverableApiError[]) =>
			E.gen(function* () {
				const { base, context } = yield* EventBusListener.parent();

				// TODO: Save error constructors inside
				// request meta
				// TODO: Check request failure events and
				// if their error types is not valid, die.
				return {
					...base,
					send(event) {
						return E.gen(this, function* () {
							return yield* context.next(event);
						});
					},
				} satisfies IEventBusListener;
			}).pipe(E.orDie),
	},
) {}
