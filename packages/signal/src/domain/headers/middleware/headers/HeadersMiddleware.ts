import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { orPanic } from "../../../errors/utils/orPanic";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { HeaderContext } from "../../HeaderContext";
import { THeaderSupplier } from "./HeadersMiddlewareFactory";

export class HeadersMiddleware extends Middleware("HeadersMiddleware", {
	priority: MiddlewarePriority.Creation,
})(
	(headerSupplier: THeaderSupplier) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);

				const updateHeaders = E.fn(function* () {
					const headerContext = yield* requestContext.getOrCreate(
						"headers",
						E.succeed(new HeaderContext()),
					);
					const contextSnapshot = yield* requestContext.getSnapshot();

					yield* SynchronizedRef.getAndUpdateEffect(headerContext, (headers) =>
						E.gen(function* () {
							const headerRecord = headers.getState();
							const adapter = headers.getAdapter();

							const getUpdatedHeaders = P.isFunction(headerSupplier)
								? async () =>
										await headerSupplier(headerRecord, contextSnapshot)
								: async () => headerSupplier;
							const updatedHeaders = yield* E.promise(() =>
								getUpdatedHeaders(),
							);

							adapter.setHeaders(updatedHeaders);
							return headers;
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
