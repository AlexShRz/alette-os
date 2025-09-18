import * as E from "effect/Effect";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { RequestMeta } from "../../../execution/services/RequestMeta";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { UnknownErrorCaught } from "../../errors/UnknownErrorCaught";
import { panic } from "../../utils/panic";
import { IRecognizedRequestError } from "./RequestRecoverableErrors";

export class ThrowsMiddleware extends Middleware("ThrowsMiddleware", {
	priority: MiddlewarePriority.Interception,
})(
	(recoverableErrors: IRecognizedRequestError[]) =>
		({ parent, context }) =>
			E.gen(function* () {
				const meta = yield* E.serviceOptional(RequestMeta);
				const errorConfig = meta.getErrorConfig();
				errorConfig.addRecognizedErrors(recoverableErrors);

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof ApplyRequestState)) {
								return yield* context.next(event);
							}

							/**
							 * We cannot rely on RequestState.isFailure(event)
							 * checks here, because we can receive a random error
							 * */
							const { isError, error } = event.getState();

							if (isError && !errorConfig.isRecognizedError(error)) {
								yield* panic(new UnknownErrorCaught(error));
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
