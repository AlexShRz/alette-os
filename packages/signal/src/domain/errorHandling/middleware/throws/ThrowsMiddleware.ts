import { Listener } from "@alette/event-sourcing";
import { IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { IRecoverableApiError } from "./RequestRecoverableErrors";

export class ThrowsMiddleware extends Listener("ThrowsMiddleware")(
	(recoverableErrors: IRecoverableApiError[]) =>
		({ parent, context }) =>
			E.gen(function* () {
				// TODO: Save error constructors inside
				// request meta
				// TODO: Check request failure events and
				// if their error types is not valid, die.
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							return yield* context.next(event);
						});
					},
				} satisfies IEventBusListener;
			}).pipe(E.orDie),
) {}
