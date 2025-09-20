import * as Duration from "effect/Duration";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as Runtime from "effect/Runtime";
import { GlobalContext } from "../../../context/services/GlobalContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { WithCurrentRequestOverride } from "../../events/envelope/WithCurrentRequestOverride";
import { RequestMode } from "../../services/RequestMode";
import { TThrottleMiddlewareDurationSupplier } from "./ThrottleMiddlewareFactory";

// TODO: All leading/trailing throttle later
export class ThrottleMiddleware extends Middleware("DebounceMiddleware", {
	priority: MiddlewarePriority.Interception,
})(
	(durationProvider: TThrottleMiddlewareDurationSupplier) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestMode = yield* E.serviceOptional(RequestMode);
				const isOneShotRequest = requestMode.isOneShot();

				if (isOneShotRequest) {
					return {
						...parent,
					};
				}

				const runFork = Runtime.runFork(yield* E.runtime<never>());
				const globalContextService = yield* E.serviceOptional(GlobalContext);
				const globalContext = yield* globalContextService.get();

				/**
				 * We obtain duration immediately and
				 * keep it for the whole lifecycle.
				 * */
				const getDuration = P.isFunction(durationProvider)
					? async () => await durationProvider({ context: globalContext })
					: async () => durationProvider;
				const obtainedDuration = yield* E.promise(() => getDuration());
				const durationInMillis = Duration.toMillis(
					Duration.decode(obtainedDuration),
				);

				/**
				 * TODO: We are going to use normal setTimeout here,
				 * without relying on effect utils:
				 * 1. There's something with their TestClock that does
				 * not allow us to adjust time in tests if our managed runtimes are nested.
				 * */
				let throttledDelivery: number | null = null;
				const throttleDelivery = (event: WithCurrentRequestOverride) =>
					setTimeout(() => {
						const task = context.sendToBus(event).pipe(
							E.andThen(() => {
								throttledDelivery = null;
							}),
						);
						runFork(task);
					}, durationInMillis);

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							/**
							 * 1. We need to look for "run request" events sent by the user, not
							 * just raw "run request" events.
							 * 2. For example, it makes no sense to debounce retry run request
							 * events sent by the system, etc.
							 * */
							if (!(event instanceof WithCurrentRequestOverride)) {
								return yield* context.next(event);
							}

							/**
							 * If throttle is in progress, cancel
							 * other "run request" events
							 * */
							if (throttledDelivery) {
								return yield* E.zipRight(event.cancel(), context.next(event));
							}

							const wrappedEvent = event.getWrappedEvent();
							const userSuppliedSettings = wrappedEvent.getSettingSupplier()();
							if (
								P.hasProperty(userSuppliedSettings, "skipThrottle") &&
								userSuppliedSettings.skipThrottle === true
							) {
								return yield* context.next(event);
							}

							throttledDelivery = throttleDelivery(
								event.clone(),
							) as unknown as number;

							return yield* E.zipRight(event.cancel(), context.next(event));
						});
					},
				};
			}),
) {}
