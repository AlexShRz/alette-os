import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { orPanic } from "../../../errors/utils/orPanic";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { MethodContext } from "../../context/method/MethodContext";
import { TMethodSupplier } from "./MethodMiddlewareFactory";

export class MethodMiddleware extends Middleware("MethodMiddleware", {
	priority: MiddlewarePriority.Creation,
})(
	(methodSupplier: TMethodSupplier) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);

				const updateHeaders = E.fn(function* () {
					const methodContext = yield* requestContext.getOrCreate(
						"method",
						E.succeed(new MethodContext()),
					);
					const contextSnapshot = yield* requestContext.getSnapshot();

					yield* SynchronizedRef.getAndUpdateEffect(methodContext, (method) =>
						E.gen(function* () {
							const getUpdatedMethod = P.isFunction(methodSupplier)
								? async () => await methodSupplier(contextSnapshot)
								: async () => methodSupplier;
							const updatedMethod = yield* E.promise(() => getUpdatedMethod());

							method.set(updatedMethod);
							return method;
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
