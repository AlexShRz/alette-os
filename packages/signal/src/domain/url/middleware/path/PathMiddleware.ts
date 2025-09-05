import { Listener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SyncRef from "effect/SynchronizedRef";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { getOrCreateUrlContext } from "../getOrCreateUrlContext";
import { TPathMiddlewareArgs } from "./PathMiddlewareFactory";

export class PathMiddleware extends Listener.as("PathMiddleware")(
	(args: TPathMiddlewareArgs) =>
		({ parent }) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);

				const updateUrlContext = E.gen(function* () {
					const urlContext = yield* getOrCreateUrlContext();
					const contextSnapshot = yield* requestContext.getSnapshot();

					yield* SyncRef.getAndUpdateEffect(urlContext, (url) =>
						E.gen(function* () {
							const state = url.getState();
							const adapter = url.getAdapter();

							const updatedPath = P.isFunction(args)
								? args(state.getPath(), contextSnapshot)
								: args;

							adapter.setPath(updatedPath);
							return url;
						}),
					);
				});

				return {
					...parent,
				};
			}).pipe(E.orDie),
) {}
