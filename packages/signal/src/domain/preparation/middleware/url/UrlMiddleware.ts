import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { orPanic } from "../../../errors/utils/orPanic";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { getOrCreateUrlContext } from "../../context/url/getOrCreateUrlContext";
import {
	IUrlMiddlewareCollectedUrlProps,
	TUrlMiddlewareArgs,
} from "./UrlMiddlewareFactory";

export class UrlMiddleware extends Middleware("UrlMiddleware", {
	priority: MiddlewarePriority.Creation,
})(
	(urlSupplier: TUrlMiddlewareArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);

				const updateUrlConstructor = E.fn(function* () {
					const urlContext = yield* getOrCreateUrlContext();
					const contextSnapshot = yield* requestContext.getSnapshot();

					yield* SynchronizedRef.getAndUpdateEffect(urlContext, (url) =>
						E.gen(function* () {
							const state = url.getState();

							const getConstructedUrl = P.isFunction(urlSupplier)
								? (props: IUrlMiddlewareCollectedUrlProps) =>
										urlSupplier(props, contextSnapshot)
								: () => urlSupplier;

							state.setConstructor(({ queryParams, origin, path }) =>
								getConstructedUrl({
									origin,
									path,
									queryParams: queryParams.get(),
								}),
							);
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
								event.executeLazyLast((operation) =>
									operation.pipe(E.andThen(updateUrlConstructor)),
								),
							);
						});
					},
				};
			}),
) {}
