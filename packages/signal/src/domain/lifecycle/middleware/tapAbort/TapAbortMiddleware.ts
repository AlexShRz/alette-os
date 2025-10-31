import * as E from "effect/Effect";
import { AbortRequest } from "../../../execution/events/request/AbortRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { TTapAbortArgs } from "./TapAbortMiddlewareFactory";

export class TapAbortMiddleware extends Middleware("TapAbortMiddleware", {
	priority: MiddlewarePriority.BeforeExecution,
})(
	(tapAbortMiddleware: TTapAbortArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const scope = yield* E.scope;
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const runTapAbort = () =>
					E.gen(function* () {
						const requestContext = yield* sessionContext.getSnapshot();
						yield* E.promise(
							async () => await tapAbortMiddleware(requestContext),
						);
					}).pipe(E.forkIn(scope));

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof AbortRequest)) {
								return yield* context.next(event);
							}

							return yield* context.next(event.onComplete(runTapAbort));
						});
					},
				};
			}),
) {}
