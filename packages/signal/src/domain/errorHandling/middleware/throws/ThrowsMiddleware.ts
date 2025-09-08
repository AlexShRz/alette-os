import { IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { RequestState } from "../../../execution/events/request/RequestState";
import { RequestMeta } from "../../../execution/services/RequestMeta";
import { Middleware } from "../../../middleware/Middleware";
import { IRecognizedRequestError } from "./RequestRecoverableErrors";

export class ThrowsMiddleware extends Middleware("ThrowsMiddleware")(
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
							if (
								!(event instanceof ApplyRequestState) ||
								!RequestState.isFailure(event)
							) {
								return yield* context.next(event);
							}

							const { error } = event.getState();

							if (!errorConfig.isRecognizedError(error)) {
								const text = `[ThrowsMiddleware] - unrecognized request error was thrown. Error data -`;
								return yield* E.dieMessage(`${text} '${error}'`);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
