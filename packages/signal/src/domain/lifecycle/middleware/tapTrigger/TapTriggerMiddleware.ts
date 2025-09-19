import * as E from "effect/Effect";
import { GlobalContext } from "../../../context/services/GlobalContext";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { TTapTriggerArgs } from "./TapTriggerMiddlewareFactory";

export class TapTriggerMiddleware extends Middleware("TapTriggerMiddleware", {
	priority: MiddlewarePriority.BeforeExecution,
})(
	(tapFn: TTapTriggerArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const globalContext = yield* E.serviceOptional(GlobalContext);

				const runTap = E.gen(function* () {
					const obtainedContext = yield* globalContext.get();
					yield* E.promise(() => {
						const configured = async () =>
							await tapFn({ context: obtainedContext });
						return configured();
					});
				});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof RunRequest)) {
								return yield* context.next(event);
							}

							yield* runTap;

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
