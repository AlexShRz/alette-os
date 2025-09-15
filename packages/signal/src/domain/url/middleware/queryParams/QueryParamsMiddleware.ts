import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { orPanic } from "../../../errors/utils/orPanic";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { getOrCreateUrlContext } from "../getOrCreateUrlContext";
import { TQueryParamsMiddlewareArgs } from "./QueryParamsMiddlewareFactory";

export class QueryParamsMiddleware extends Middleware("QueryParamsMiddleware", {
	priority: MiddlewarePriority.Creation,
})(
	(queryParamSupplier: TQueryParamsMiddlewareArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);

				const updateParams = E.fn(function* () {
					const urlContext = yield* getOrCreateUrlContext();
					const contextSnapshot = yield* requestContext.getSnapshot();

					yield* SynchronizedRef.getAndUpdateEffect(urlContext, (url) =>
						E.gen(function* () {
							const state = url.getState();
							const adapter = url.getAdapter();

							const getUpdatedQueryParams = P.isFunction(queryParamSupplier)
								? async () =>
										await queryParamSupplier(
											state.getParams().get(),
											contextSnapshot,
										)
								: async () => queryParamSupplier;
							const updatedParams = yield* E.promise(() =>
								getUpdatedQueryParams(),
							);

							adapter.setQueryParams(updatedParams);
							return url;
						}),
					).pipe(orPanic);
				});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof RunRequest)) {
								return yield* context.next(event);
							}

							return yield* context.next(
								event.executeLazy((operation) =>
									operation.pipe(E.andThen(updateParams)),
								),
							);
						});
					},
				};
			}),
) {}
