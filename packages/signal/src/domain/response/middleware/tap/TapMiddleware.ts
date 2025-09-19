import * as E from "effect/Effect";
import { TTapErrorArgs } from "../../../errors/middleware/tapError/TapErrorMiddlewareFactory";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { RequestState } from "../../../execution/events/request/RequestState";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";

export class TapMiddleware extends Middleware("TapMiddleware", {
	priority: MiddlewarePriority.Mapping,
})(
	(tapSuccessFn: TTapErrorArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const runTap = (response: unknown) =>
					E.gen(function* () {
						const requestContext = yield* sessionContext.getSnapshot();

						yield* E.promise(() => {
							const configured = async () =>
								await tapSuccessFn(response, requestContext);
							return configured();
						});
					});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (
								event instanceof ApplyRequestState &&
								RequestState.isSuccess(event)
							) {
								yield* runTap(event.getResult());
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
