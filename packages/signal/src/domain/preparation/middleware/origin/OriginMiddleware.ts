import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { orPanic } from "../../../errors/utils/orPanic";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { getOrCreateUrlContext } from "../../context/url/getOrCreateUrlContext";
import { GlobalUrlConfig } from "../../context/url/services/GlobalUrlConfig";
import { TOriginMiddlewareArgs } from "./Origin";

export class OriginMiddleware extends Middleware("OriginMiddleware", {
	priority: MiddlewarePriority.Creation,
})(
	(originSupplier?: TOriginMiddlewareArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);

				const provideOriginContext = E.gen(function* () {
					const globalUrlConfig = yield* E.serviceOptional(GlobalUrlConfig);
					const urlContext = yield* getOrCreateUrlContext();
					const contextSnapshot = yield* requestContext.getSnapshot();

					yield* SynchronizedRef.getAndUpdateEffect(urlContext, (url) =>
						E.gen(function* () {
							const state = url.getState();
							const adapter = url.getAdapter();

							if (!originSupplier) {
								adapter.setOrigin(globalUrlConfig.getOrigin());
								return url;
							}

							const getUpdatedPath = P.isFunction(originSupplier)
								? async () =>
										await originSupplier(contextSnapshot, state.getOrigin())
								: async () => originSupplier;

							const newOrigin = yield* E.promise(() => getUpdatedPath());

							adapter.setOrigin(newOrigin);
							return url;
						}),
					);
				}).pipe(orPanic);

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof RunRequest)) {
								return yield* context.next(event);
							}

							return yield* context.next(
								event.executeLazy((operation) =>
									operation.pipe(E.andThen(() => provideOriginContext)),
								),
							);
						});
					},
				};
			}),
) {}
