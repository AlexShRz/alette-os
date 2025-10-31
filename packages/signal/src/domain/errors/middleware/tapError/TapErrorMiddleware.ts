import { ApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { RequestState } from "../../../execution/events/request/RequestState";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { TTapErrorArgs } from "./TapErrorMiddlewareFactory";

export class TapErrorMiddleware extends Middleware("TapErrorMiddleware", {
	priority: MiddlewarePriority.Mapping,
})(
	(tapErrorFn: TTapErrorArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const scope = yield* E.scope;
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const runTap = (error: ApiError) =>
					E.gen(function* () {
						const requestContext = yield* sessionContext.getSnapshot();

						yield* E.promise(() => {
							const configured = async () =>
								await tapErrorFn(error, requestContext);
							return configured();
						});
					}).pipe(E.forkIn(scope));

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (
								event instanceof ApplyRequestState &&
								RequestState.isFailure(event)
							) {
								yield* runTap(event.getError());
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
