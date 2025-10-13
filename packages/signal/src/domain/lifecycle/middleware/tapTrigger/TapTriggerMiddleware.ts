import * as E from "effect/Effect";
import { GlobalContext } from "../../../context/services/GlobalContext";
import { WithCurrentRequestOverride } from "../../../execution/events/envelope/WithCurrentRequestOverride";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { TTapTriggerArgs } from "./TapTriggerMiddlewareFactory";

export class TapTriggerMiddleware extends Middleware("TapTriggerMiddleware", {
	priority: MiddlewarePriority.OutOfBounds,
})(
	(tapFn: TTapTriggerArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const scope = yield* E.scope;
				const globalContext = yield* E.serviceOptional(GlobalContext);

				const runTap = E.gen(function* () {
					const obtainedContext = yield* globalContext.get();
					yield* E.promise(() => {
						const configured = async () =>
							await tapFn({ context: obtainedContext });
						return configured();
					});
				}).pipe(E.forkIn(scope));

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof WithCurrentRequestOverride) {
								yield* runTap;
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
