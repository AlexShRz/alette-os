import { Listener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SyncRef from "effect/SynchronizedRef";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { GlobalUrlConfig } from "../../services/GlobalUrlConfig";
import { getOrCreateUrlContext } from "../getOrCreateUrlContext";
import { TOriginMiddlewareArgs } from "./OriginMiddlewareFactory";

export class OriginMiddleware extends Listener.as("OriginMiddleware")(
	(args?: TOriginMiddlewareArgs) =>
		({ parent }) =>
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
				});

				return {
					...parent,
				};
			}).pipe(E.orDie),
) {}
