import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { orPanic } from "../../../errors/utils/orPanic";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { getOrCreateHeaderContext } from "../../context/headers/getOrCreateHeaderContext";
import { THeaderSupplier } from "./HeadersMiddlewareFactory";

export class HeadersMiddleware extends Middleware("HeadersMiddleware", {
	priority: MiddlewarePriority.Creation,
})(
	(headerSupplier: THeaderSupplier) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);

				const updateHeaders = E.fn(function* () {
					const headerContext = yield* getOrCreateHeaderContext;
					const contextSnapshot = yield* requestContext.getSnapshot();

					yield* SynchronizedRef.getAndUpdateEffect(
						headerContext,
						(headerContext) =>
							E.gen(function* () {
								const prevHeaders = headerContext.getState();
								const adapter = headerContext.getAdapter();

								const getUpdatedHeaders = P.isFunction(headerSupplier)
									? async () =>
											await headerSupplier(prevHeaders, contextSnapshot)
									: async () => headerSupplier;
								const newHeaders = yield* E.promise(() => getUpdatedHeaders());

								/**
								 * Make sure we fully override prev headers here
								 * */
								adapter.setHeaders(newHeaders);
								return headerContext;
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
									operation.pipe(E.andThen(updateHeaders)),
								),
							);
						});
					},
				};
			}),
) {}
