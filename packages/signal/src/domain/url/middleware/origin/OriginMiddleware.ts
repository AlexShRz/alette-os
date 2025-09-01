import { EventBusListener } from "@alette/event-sourcing";
import { EventBusListenerTag, IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SyncRef from "effect/SynchronizedRef";
import { IRequestContext } from "../../../context/IRequestContext";
import { TExposedRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { GlobalUrlConfig } from "../../services/GlobalUrlConfig";
import { getOrCreateUrlContext } from "../getOrCreateUrlContext";
import { TGetRequestOrigin } from "./RequestOrigin";

export type TOriginMiddlewareArgs<
	NewOrigin extends string = string,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			prevPath: TGetRequestOrigin<C>,
			context: TExposedRequestContext<C>,
	  ) => NewOrigin)
	| NewOrigin;

export class OriginMiddleware extends E.Service<EventBusListener>()(
	EventBusListenerTag,
	{
		scoped: (args?: TOriginMiddlewareArgs) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);
				const { base, context } = yield* EventBusListener.parent();

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
