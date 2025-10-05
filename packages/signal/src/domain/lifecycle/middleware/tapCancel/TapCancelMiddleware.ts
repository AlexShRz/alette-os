import * as E from "effect/Effect";
import { CancelRequest } from "../../../execution/events/CancelRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { TTapCancelArgs } from "./TapCancelMiddlewareFactory";

export class TapCancelMiddleware extends Middleware("TapCancelMiddleware", {
	priority: MiddlewarePriority.BeforeExecution,
})(
	(tapCancelFn: TTapCancelArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const runTapCancel = E.fn(function* () {
					const requestContext = yield* sessionContext.getSnapshot();
					yield* E.promise(async () => await tapCancelFn(requestContext));
				});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof CancelRequest)) {
								return yield* context.next(event);
							}

							return yield* context.next(event.onComplete(runTapCancel));
						});
					},
				};
			}),
) {}
