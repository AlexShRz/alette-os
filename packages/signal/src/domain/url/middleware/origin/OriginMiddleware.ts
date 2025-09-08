import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SyncRef from "effect/SynchronizedRef";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { GlobalUrlConfig } from "../../services/GlobalUrlConfig";
import { getOrCreateUrlContext } from "../getOrCreateUrlContext";
import { TOriginMiddlewareArgs } from "./OriginMiddlewareFactory";

export class OriginMiddleware extends Middleware("OriginMiddleware", {
	priority: MiddlewarePriority.Creational,
})(
	(args?: TOriginMiddlewareArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);

				const provideOriginContext = E.gen(function* () {
					const globalUrlConfig = yield* E.serviceOptional(GlobalUrlConfig);
					const urlContext = yield* getOrCreateUrlContext();
					const contextSnapshot = yield* requestContext.getSnapshot();

					yield* SyncRef.getAndUpdateEffect(urlContext, (url) =>
						E.gen(function* () {
							const state = url.getState();
							const adapter = url.getAdapter();

							if (!args) {
								adapter.setOrigin(globalUrlConfig.getOrigin());
								return url;
							}

							const updatedPath = P.isFunction(args)
								? args(state.getOrigin(), contextSnapshot)
								: args;

							adapter.setOrigin(updatedPath);
							return url;
						}),
					);
				}).pipe(E.orDie);

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof RunRequest)) {
								return yield* context.next(event);
							}

							return yield* context.next(
								event.updateContextProvider((provider) =>
									provider.pipe(E.andThen(() => provideOriginContext)),
								),
							);
						});
					},
				};
			}),
) {}
