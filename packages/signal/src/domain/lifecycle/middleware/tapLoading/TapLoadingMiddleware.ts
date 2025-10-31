import * as E from "effect/Effect";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { RequestState } from "../../../execution/events/request/RequestState";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { TTapLoadingArgs } from "./TapLoadingMiddlewareFactory";

export class TapLoadingMiddleware extends Middleware("TapLoadingMiddleware", {
	priority: MiddlewarePriority.Mapping,
})(
	(tapLoadingFn: TTapLoadingArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const scope = yield* E.scope;
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const runTapLoading = E.gen(function* () {
					const requestContext = yield* sessionContext.getSnapshot();

					yield* E.promise(() => {
						const configured = async () => await tapLoadingFn(requestContext);
						return configured();
					});
				}).pipe(E.forkIn(scope));

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (
								event instanceof ApplyRequestState &&
								RequestState.isLoading(event)
							) {
								yield* runTapLoading;
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
