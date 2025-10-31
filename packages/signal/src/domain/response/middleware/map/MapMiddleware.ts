import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { RequestState } from "../../../execution/events/request/RequestState";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { IOneShotRequestState } from "../../../execution/state/IOneShotRequestState";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { TMapArgs } from "./MapMiddlewareFactory";

export class MapMiddleware extends Middleware("MapMiddleware", {
	priority: MiddlewarePriority.Mapping,
})(
	(mapFn: TMapArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const mapFromEvent = (
					event: ApplyRequestState<
						IRequestContext,
						IOneShotRequestState.Success
					>,
				) =>
					E.gen(function* () {
						const requestContext = yield* sessionContext.getSnapshot();

						const updateEvent = () =>
							event.update(async ({ data, ...otherState }) => {
								const mapper = async (value: unknown) =>
									await mapFn(value, requestContext);
								const updatedResponseRef = await data.map((value) =>
									mapper(value),
								);

								return {
									...otherState,
									data: updatedResponseRef,
								};
							});

						return yield* E.promise(() => updateEvent());
					});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (
								event instanceof ApplyRequestState &&
								RequestState.isSuccess(event)
							) {
								const updatedEvent = yield* mapFromEvent(event);
								return yield* context.next(updatedEvent);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
