import { BusEvent } from "@alette/event-sourcing";
import { ApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as Runtime from "effect/Runtime";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { AutoRunRequest } from "../../../execution/events/request/AutoRunRequest";
import { RequestState } from "../../../execution/events/request/RequestState";
import { RequestMetrics } from "../../../execution/services/RequestMetrics";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { IRetrySettings } from "../RetrySettings";
import { IRetryWhenMiddlewareArgs } from "./RetryWhen";

export class RetryWhenMiddleware extends Middleware("RetryWhenMiddleware", {
	priority: MiddlewarePriority.Interception,
})(
	(waitForRetryDecision: IRetryWhenMiddlewareArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const metrics = yield* E.serviceOptional(RequestMetrics);
				const requestContext = yield* E.serviceOptional(RequestSessionContext);
				const runtime = yield* E.runtime();
				const runFork = Runtime.runFork(runtime);
				const runPromise = Runtime.runPromise(runtime);

				const isManuallyDisabled = E.gen(function* () {
					const getSettings = yield* requestContext.getSettingSupplier();
					const obtainedSettings: IRetrySettings = getSettings();

					return (
						P.hasProperty(obtainedSettings, "skipRetry") &&
						obtainedSettings.skipRetry
					);
				});

				const canRetryEvent = (error: ApiError) =>
					E.gen(function* () {
						const canRetry = async () => {
							const executedTimes = await runPromise(
								metrics.getAmountOfAttemptedExecutions(),
							);
							const contextSnapshot = await runPromise(
								requestContext.getSnapshot(),
							);
							const isDisabled = await runPromise(isManuallyDisabled);

							if (isDisabled) {
								return false;
							}

							return waitForRetryDecision(
								{
									error,
									attempt: executedTimes,
								},
								contextSnapshot,
							);
						};

						return yield* E.promise(() => canRetry());
					});

				const runRetryIfNeeded = (event: BusEvent) =>
					E.gen(function* () {
						if (
							!(event instanceof ApplyRequestState) ||
							!RequestState.isFailure(event)
						) {
							return event;
						}

						/**
						 * Get current request session immediately in case our
						 * user passed function takes a long time and
						 * session request id changes during that period.
						 * */
						const currentRequestId = event.getRequestId();
						const getSettings = yield* requestContext.getSettingSupplier();

						const isRetryable = yield* canRetryEvent(event.getError());

						/**
						 * If our request can be retried, we need to cancel
						 * current "failure" event and dispatch a new "run request"
						 * event.
						 * */
						if (isRetryable) {
							runFork(
								context.sendToBus(
									new AutoRunRequest(getSettings).setRequestId(
										currentRequestId,
									),
								),
							);
							yield* event.cancel();
							return event;
						}

						return event;
					});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							const nextEvent = yield* runRetryIfNeeded(event);
							return yield* context.next(nextEvent);
						});
					},
				};
			}),
) {}
