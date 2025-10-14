import * as E from "effect/Effect";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { orPanic } from "../../../errors/utils/orPanic";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { getOrCreateMiscellaneousContext } from "../../../preparation/context/getOrCreateMiscellaneousContext";
import { TCredentialArgs } from "./CredentialsMiddlewareFactory";

export class CredentialsMiddleware extends Middleware("CredentialsMiddleware", {
	priority: MiddlewarePriority.BeforeCreation,
})(
	(credentialType: TCredentialArgs = "include") =>
		({ parent, context }) =>
			E.gen(function* () {
				const setCredentialSettings = E.fn(function* () {
					const miscContext = yield* getOrCreateMiscellaneousContext;
					yield* SynchronizedRef.getAndUpdateEffect(
						miscContext,
						(miscContext) =>
							E.gen(function* () {
								miscContext.merge({
									credentials: credentialType,
								});
								return miscContext;
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

							event.executeLazy((operation) =>
								operation.pipe(E.andThen(setCredentialSettings)),
							);

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
