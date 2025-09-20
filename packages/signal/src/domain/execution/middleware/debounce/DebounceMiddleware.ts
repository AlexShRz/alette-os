import * as Duration from "effect/Duration";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as Runtime from "effect/Runtime";
import { GlobalContext } from "../../../context/services/GlobalContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { WithCurrentRequestOverride } from "../../events/envelope/WithCurrentRequestOverride";
import { RequestMode } from "../../services/RequestMode";
import { TDebounceMiddlewareDurationSupplier } from "./DebounceMiddlewareFactory";

export class DebounceMiddleware extends Middleware("DebounceMiddleware", {
	priority: MiddlewarePriority.Interception,
})(
	(durationProvider: TDebounceMiddlewareDurationSupplier) =>
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
				let scheduledDelivery: number | null = null;
				const scheduleDelivery = (event: WithCurrentRequestOverride) =>
					setTimeout(() => {
						runFork(context.sendToBus(event));
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

							const wrappedEvent = event.getWrappedEvent();
							const userSuppliedSettings = wrappedEvent.getSettingSupplier()();
							if (
								P.hasProperty(userSuppliedSettings, "skipDebounce") &&
								userSuppliedSettings.skipDebounce === true
							) {
								return yield* context.next(event);
							}

							if (scheduledDelivery) {
								clearTimeout(scheduledDelivery);
							}
							scheduledDelivery = scheduleDelivery(
								event.clone(),
							) as unknown as number;

							return yield* E.zipRight(event.cancel(), context.next(event));
						});
					},
				};
			}),
) {}
