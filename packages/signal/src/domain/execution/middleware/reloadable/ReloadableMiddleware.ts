import { IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import isEqual from "lodash.isequal";
import { GlobalContext } from "../../../context/services/GlobalContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { WithReloadableCheck } from "../../events/envelope/WithReloadableCheck";
import { RunRequest } from "../../events/request/RunRequest";
import { RequestSession } from "../../services/RequestSession";
import { RequestSessionContext } from "../../services/RequestSessionContext";
import { IReloadableMiddlewareCheck } from "./ReloadableMiddlewareFactory";

export class ReloadableMiddleware extends Middleware("ReloadableMiddleware", {
	priority: MiddlewarePriority.Interception,
})(
	(predicate?: IReloadableMiddlewareCheck) =>
		({ parent, context }) =>
			E.gen(function* () {
				const session = yield* E.serviceOptional(RequestSession);
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);
				const globalContext = yield* E.serviceOptional(GlobalContext);

				const isOneShot = session.getMode() === "oneShot";

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							/**
							 * If our request mode is "oneShot",
							 * this middleware should be disabled.
							 * */
							if (isOneShot || !(event instanceof WithReloadableCheck)) {
								return yield* context.next(event);
							}

							const unwrappedEvent = event.getWrappedEvent();

							if (!(unwrappedEvent instanceof RunRequest)) {
								return yield* context.next(event);
							}

							const currentContext = yield* sessionContext.getSnapshot();
							const isEmptyContext = !Object.keys(currentContext).length;

							const prevContext = isEmptyContext ? null : currentContext;
							const currentRequestSettings =
								unwrappedEvent.getSettingSupplier()();

							/**
							 * 1. If our predicate was not provided, we should
							 * fall back to default check that just does isEqual(prevArgs, args).
							 * 2. If our arguments are not equal, the request can be reloaded
							 * */
							const doArgumentsDiffer = () => {
								const previousContext = prevContext ?? {};

								return (
									P.hasProperty(previousContext, "args") &&
									P.hasProperty(currentRequestSettings, "args") &&
									!isEqual(previousContext.args, currentRequestSettings.args)
								);
							};

							const isReloadable = predicate
								? () =>
										predicate(
											{
												prev: prevContext,
												current: currentRequestSettings,
											},
											{ context: globalContext.get() },
										)
								: doArgumentsDiffer;

							if (!isReloadable()) {
								yield* unwrappedEvent.cancel();
							}

							return yield* context.next(event.peel());
						});
					},
				} satisfies IEventBusListener;
			}),
) {}
