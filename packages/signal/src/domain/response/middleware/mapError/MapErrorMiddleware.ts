import { ApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { RequestState } from "../../../execution/events/request/RequestState";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { IOneShotRequestState } from "../../../execution/state/IOneShotRequestState";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { TMapErrorArgs } from "./MapErrorMiddlewareFactory";

export class MapErrorMiddleware extends Middleware("MapErrorMiddleware", {
	priority: MiddlewarePriority.Mapping,
})(
	(mapErrorFn: TMapErrorArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const mapErrorFromEvent = (
					event: ApplyRequestState<
						IRequestContext,
						IOneShotRequestState.Failure
					>,
				) =>
					E.gen(function* () {
						const requestContext = yield* sessionContext.getSnapshot();

						const updateErrorEvent = () =>
							event.update(async ({ error, ...otherState }) => {
								const mapper = async (value: unknown) =>
									await mapErrorFn(value, requestContext);
								/**
								 * Make sure to clone the error before mapping.
								 * */
								const updatedError = await mapper((error as ApiError).clone());

								return {
									...otherState,
									error: updatedError,
								};
							});

						return yield* E.promise(() => updateErrorEvent());
					});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (
								event instanceof ApplyRequestState &&
								RequestState.isFailure(event)
							) {
								const updatedErrorEvent = yield* mapErrorFromEvent(event);
								return yield* context.next(updatedErrorEvent);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
