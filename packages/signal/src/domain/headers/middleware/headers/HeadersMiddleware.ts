import { validateHeaders } from "@alette/pulse";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { orPanic } from "../../../errors/utils/orPanic";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { HeaderContext } from "../../HeaderContext";
import { THeaderSupplier } from "../../RequestHeaders";

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

					yield* SynchronizedRef.getAndUpdateEffect(
						headerContext,
						(headerContext) =>
							E.gen(function* () {
								const prevHeaders = headerContext.getState();
								const adapter = headerContext.getAdapter();

								/**
								 * If a function was passed, then we completely
								 * replace our headers.
								 * */
								if (P.isFunction(headerSupplier)) {
									const getUpdatedHeaders = async () =>
										await headerSupplier(prevHeaders, contextSnapshot);
									const newHeaders = yield* E.promise(() =>
										getUpdatedHeaders(),
									);
									adapter.setHeaders(newHeaders);
									return headerContext;
								}

								/**
								 * If a record was passed, then we need to
								 * merge our prev and current headers.
								 * */
								const getUpdatedHeaders = async () => headerSupplier;
								const newHeaders = yield* E.promise(() => getUpdatedHeaders());

								/**
								 * Validate headers first
								 * */
								const validatedHeaders = validateHeaders(newHeaders);

								adapter.setHeaders({
									...prevHeaders,
									...validatedHeaders,
								});
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
