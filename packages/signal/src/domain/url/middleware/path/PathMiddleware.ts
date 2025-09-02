import { EventBusListener } from "@alette/event-sourcing";
import { EventBusListenerTag, IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SyncRef from "effect/SynchronizedRef";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { getOrCreateUrlContext } from "../getOrCreateUrlContext";
import { TGetRequestPath } from "./RequestPath";

export type TPathMiddlewareArgs<
	NextPath extends string = string,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			prevPath: TGetRequestPath<C>,
			context: TGetAllRequestContext<C>,
	  ) => NextPath)
	| NextPath;

export class PathMiddleware extends E.Service<EventBusListener>()(
	EventBusListenerTag,
	{
		scoped: (args: TPathMiddlewareArgs) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);
				const { base, context } = yield* EventBusListener.parent();

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
					...base,
					send(event) {
						return E.gen(this, function* () {
							return yield* context.next(event);
						});
					},
				} satisfies IEventBusListener;
			}).pipe(E.orDie),
	},
) {}
