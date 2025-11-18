import { ApiError, IHeaders, RequestFailedError } from "@alette/pulse";
import * as E from "effect/Effect";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { Cookie, Token } from "../../../../application";
import { GlobalContext } from "../../../context/services/GlobalContext";
import { orPanic } from "../../../errors/utils/orPanic";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { RequestState } from "../../../execution/events/request/RequestState";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { getOrCreateMiscellaneousContext } from "../../../preparation/context/getOrCreateMiscellaneousContext";
import { getOrCreateHeaderContext } from "../../../preparation/context/headers/getOrCreateHeaderContext";
import { TBearerMiddlewareArgs } from "./Bearer";

export class BearerMiddleware extends Middleware("BearerMiddleware", {
	priority: MiddlewarePriority.BeforeCreation,
})(
	(authEntityOrProvider: TBearerMiddlewareArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const globalContext = yield* E.serviceOptional(GlobalContext);
				const authEntity = yield* E.gen(function* () {
					if (typeof authEntityOrProvider !== "function") {
						return authEntityOrProvider;
					}

					return yield* E.promise(async () =>
						authEntityOrProvider({
							context: await globalContext.getAsPromise(),
						}),
					);
				}).pipe(orPanic);

				const updateHeaders = E.fn(function* (newHeaders: IHeaders) {
					const headerContext = yield* getOrCreateHeaderContext;
					yield* SynchronizedRef.getAndUpdateEffect(
						headerContext,
						(headerContext) =>
							E.gen(function* () {
								headerContext.addSystemInjectedHeaders(newHeaders);
								return headerContext;
							}),
					).pipe(orPanic);
				});

				const prepareCookie = E.fn(function* (cookie: Cookie) {
					const miscContext = yield* getOrCreateMiscellaneousContext;
					yield* E.promise(() => cookie.load());
					yield* SynchronizedRef.getAndUpdateEffect(
						miscContext,
						(miscContext) =>
							E.gen(function* () {
								miscContext.merge({
									credentials: "include",
								});
								return miscContext;
							}),
					).pipe(orPanic);
				});

				const maybeMarkAuthEntityAsInvalid = (error: ApiError) =>
					E.gen(function* () {
						if (!(error instanceof RequestFailedError)) {
							return;
						}

						const authStatus = error.getStatus();

						if (authStatus === 401 || authStatus === 419) {
							authEntity.invalidate();
						}
					});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (
								event instanceof ApplyRequestState &&
								RequestState.isFailure(event)
							) {
								yield* maybeMarkAuthEntityAsInvalid(event.getError());
								return yield* context.next(event);
							}

							if (!(event instanceof RunRequest)) {
								return yield* context.next(event);
							}

							if (authEntity instanceof Cookie) {
								event.executeLazy((operation) =>
									operation.pipe(E.andThen(() => prepareCookie(authEntity))),
								);
							}

							if (authEntity instanceof Token) {
								event.executeLazy((operation) =>
									operation.pipe(
										E.andThen(
											E.fn(function* () {
												const tokenHeaders = yield* E.promise(() =>
													authEntity.toHeaders(),
												);
												yield* updateHeaders(tokenHeaders);
											}),
										),
									),
								);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
