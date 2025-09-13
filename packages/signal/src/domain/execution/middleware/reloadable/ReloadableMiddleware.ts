import { IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SynchronizedRef from "effect/SynchronizedRef";
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
				const globalContext = yield* E.serviceOptional(GlobalContext);
				/**
				 * 1. Prev context can be empty because reloadable
				 * runs BEFORE any creational middleware - origin()/path(), etc.
				 * 2. We need to get context from the session on "run request"
				 * event application and store it here.
				 * 3. We cannot store the context anywhere else, because on
				 * request id change it will be wiped.
				 * */
				const prevContextSnapshot = yield* SynchronizedRef.make<Record<
					string,
					unknown
				> | null>(null);

				const saveContextSnapshot = E.fn(function* () {
					const sessionContext = yield* E.serviceOptional(
						RequestSessionContext,
					).pipe(E.orDie);

					yield* SynchronizedRef.set(
						prevContextSnapshot,
						yield* sessionContext.getSnapshotWithoutGlobalContext(),
					);
				});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							/**
							 * If our request mode is "oneShot",
							 * this middleware should be disabled.
							 * */
							if (
								session.isOneShotMode() ||
								!(event instanceof WithReloadableCheck)
							) {
								return yield* context.next(event);
							}

							const unwrappedEvent = event.getWrappedEvent();

							if (!(unwrappedEvent instanceof RunRequest)) {
								return yield* context.next(event);
							}

							const currentRequestSettings =
								unwrappedEvent.getSettingSupplier()();

							const obtainedPrevContext = yield* prevContextSnapshot.get;

							/**
							 * 1. If our predicate was not provided, we should
							 * fall back to default check that just does isEqual(prevArgs, args).
							 * 2. If our arguments are not equal, the request can be reloaded
							 * */
							const doArgumentsDiffer = () => {
								const prevContext = obtainedPrevContext || {};
								const doesPrevContextHaveArgs = P.hasProperty(
									prevContext,
									"args",
								);

								/**
								 * 1. If our previous context has no args set,
								 * this means that we cannot compare anything.
								 * 2. In this case, we should allow request reload
								 * and wait for our prev context snapshot to fill.
								 * */
								if (!doesPrevContextHaveArgs) {
									return true;
								}

								const doesCurrentContextHaveArgs = P.hasProperty(
									currentRequestSettings,
									"args",
								);

								/**
								 * If our current context does not have args for
								 * some reason, but prev context does, we must
								 * return false here.
								 * */
								if (!doesCurrentContextHaveArgs) {
									return false;
								}

								return !isEqual(prevContext.args, currentRequestSettings.args);
							};

							const isReloadable = predicate
								? () =>
										predicate(
											{
												prev: obtainedPrevContext,
												current: currentRequestSettings,
											},
											{ context: globalContext.get() },
										)
								: doArgumentsDiffer;

							/**
							 * If our check fails, we need to cancel the
							 * command immediately. There's no point in
							 * doing anything else.
							 * */
							if (!isReloadable()) {
								yield* unwrappedEvent.cancel();
								return yield* context.next(unwrappedEvent);
							}

							const nextEvent = event.peel();

							/**
							 * 1. We need to make sure that we SAVE our context
							 * inside our middleware local state during event completion.
							 * 2. Next time this context will be passed to our predicate
							 * for comparison.
							 * 3. Make sure we execute our context saver LAST (executeLazyLast)
							 * */
							if (nextEvent instanceof RunRequest) {
								nextEvent.executeLazyLast((p) =>
									p.pipe(E.andThen(saveContextSnapshot)),
								);
							}

							return yield* context.next(nextEvent);
						});
					},
				} satisfies IEventBusListener;
			}),
) {}
