import * as E from "effect/Effect";
import { CancelRequest } from "../../../execution/events/request/CancelRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { TTapCancelArgs } from "./TapCancel";

export class TapCancelMiddleware extends Middleware("TapCancelMiddleware", {
	priority: MiddlewarePriority.BeforeExecution,
})(
	(tapCancelFn: TTapCancelArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const scope = yield* E.scope;
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const runTapCancel = () =>
					E.gen(function* () {
						const requestContext = yield* sessionContext.getSnapshot();
						yield* E.promise(async () => await tapCancelFn(requestContext));
					}).pipe(E.forkIn(scope));

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
