import { ApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import { SessionEventEnvelope } from "../../../execution/events/SessionEventEnvelope";
import { WithCurrentRequestOverride } from "../../../execution/events/envelope/WithCurrentRequestOverride";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { RequestState } from "../../../execution/events/request/RequestState";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestMetrics } from "../../../execution/services/RequestMetrics";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { attachRequestId } from "../../../execution/utils/attachRequestId";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { IRetryMiddlewareArgs } from "./RetryWhenMiddlewareFactory";

export class RetryWhenMiddleware extends Middleware("RetryWhenMiddleware", {
	priority: MiddlewarePriority.Mapping,
})(
	(errorProcessor: IRetryMiddlewareArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const metrics = yield* E.serviceOptional(RequestMetrics);
				const requestContext = yield* E.serviceOptional(RequestSessionContext);
				const runtime = yield* E.runtime();
				const runFork = Runtime.runFork(runtime);
				const runPromise = Runtime.runPromise(runtime);
				let lastRunRequestEventSnapshot: RunRequest | null = null;

				const canRetryEvent = (error: ApiError) =>
					E.gen(function* () {
						const canRetry = async () => {
							const executedTimes = await runPromise(
								metrics.getAmountOfAttemptedExecutions(),
							);
							const contextSnapshot = await runPromise(
								requestContext.getSnapshot(),
							);

							return errorProcessor(
								{
									error,
									attempt: executedTimes,
								},
								contextSnapshot,
							);
						};

						const isRetryable = yield* E.promise(() => canRetry());
						return isRetryable && !!lastRunRequestEventSnapshot;
					});

				const runRetry = (eventToRetry: RunRequest) =>
					E.gen(function* () {
						const toBeRetried = yield* attachRequestId(
							new WithCurrentRequestOverride(eventToRetry),
						);
						runFork(context.sendToBus(toBeRetried));
					});

				const setLastRetryableEventSnapshot = (event: unknown) => {
					if (event instanceof RunRequest) {
						lastRunRequestEventSnapshot = event.clone();
						return;
					}

					if (!(event instanceof SessionEventEnvelope)) {
						return;
					}

					const wrappedEvent = event.getWrappedEvent();

					if (wrappedEvent instanceof RunRequest) {
						lastRunRequestEventSnapshot = wrappedEvent.clone();
						return;
					}
				};

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							setLastRetryableEventSnapshot(event);

							if (
								!(event instanceof ApplyRequestState) ||
								!RequestState.isFailure(event)
							) {
								return yield* context.next(event);
							}

							/**
							 * If our request can be retried, we need to cancel
							 * current "failure" event and dispatch a new "run request"
							 * event.
							 * */
							const isRetryable = yield* canRetryEvent(event.getError());

							if (isRetryable && lastRunRequestEventSnapshot) {
								yield* runRetry(lastRunRequestEventSnapshot);
								return yield* E.zipRight(event.cancel(), context.next(event));
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
