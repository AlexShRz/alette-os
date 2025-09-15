import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { ApplyRequestState } from "../../events/request/ApplyRequestState";
import { RequestState } from "../../events/request/RequestState";
import { RequestSessionContext } from "../../services/RequestSessionContext";
import { TTapErrorArgs } from "../tapError/TapErrorMiddlewareFactory";

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
