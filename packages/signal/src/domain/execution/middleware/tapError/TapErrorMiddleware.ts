import { ApiExceptionInstance } from "@alette/pulse";
import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { ApplyRequestState } from "../../events/request/ApplyRequestState";
import { RequestState } from "../../events/request/RequestState";
import { RequestSessionContext } from "../../services/RequestSessionContext";
import { TTapErrorArgs } from "./TapErrorMiddlewareFactory";

export class TapErrorMiddleware extends Middleware("TapErrorMiddleware", {
	priority: MiddlewarePriority.Mapping,
})(
	(tapErrorFn: TTapErrorArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const runTap = (error: ApiExceptionInstance) =>
					E.gen(function* () {
						const requestContext = yield* sessionContext.getSnapshot();

						yield* E.promise(() => {
							const configured = async () =>
								await tapErrorFn(error, requestContext);
							return configured();
						});
					});

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
