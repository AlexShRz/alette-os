import { IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import { OneShotRequestNotification } from "../../../lifecycle/notifications/OneShotRequestNotification";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { UrlContext } from "../../../preparation/context/url/UrlContext";
import { CancelRequest } from "../../events/CancelRequest";
import { WithCurrentRequestOverride } from "../../events/envelope/WithCurrentRequestOverride";
import { RequestState } from "../../events/request/RequestState";
import { RunRequest } from "../../events/request/RunRequest";
import { RequestRunner } from "../../services/RequestRunner";
import { RequestSessionContext } from "../../services/RequestSessionContext";
import { attachRequestId } from "../../utils/attachRequestId";
import { IRequestRunner } from "./FactoryMiddlewareFactory";

export class FactoryMiddleware extends Middleware("FactoryMiddleware", {
	priority: MiddlewarePriority.Execution,
	canReceiveEventsSentBySelf: true,
})(
	<T extends IRequestRunner>(executor: T) =>
		({ id, parent, context }) =>
			E.gen(function* () {
				const requestRunner = yield* E.serviceOptional(RequestRunner);
				const requestContext = yield* E.serviceOptional(RequestSessionContext);
				const runFork = Runtime.runFork(yield* E.runtime());

				const getFullUrl = E.gen(function* () {
					const urlContext = yield* requestContext.getOrCreate(
						"url",
						E.succeed(new UrlContext()),
					);

					return yield* urlContext.get.pipe(E.andThen((c) => c.getState()));
				});

				/**
				 * Make sure to use context.sendToBus() for notifications,
				 * otherwise the program will become stuck.
				 * */
				const sendNotification = (notification: OneShotRequestNotification) => {
					runFork(
						E.gen(function* () {
							const event = yield* notification.toEvent();
							yield* attachRequestId(event);
							runFork(context.sendToBus(event));
						}),
					);
				};

				const runRequest = (event: RunRequest) =>
					E.gen(function* () {
						/**
						 * Complete the event first to make sure
						 * that our request context is filled
						 * */
						yield* event.complete();
						const fullContext = yield* requestContext.getSnapshot();
						const fullUrl = yield* getFullUrl;

						const runner = async () =>
							await executor(
								{
									...fullContext,
									url: fullUrl,
								},
								{ notify: sendNotification },
							);

						/**
						 * IMPORTANT:
						 * 1. Use runFork to dispatch state events to the bus
						 * WITHOUT waiting for their result.
						 * 2. This is faster than "yield*".
						 * */
						yield* requestRunner.supervise(
							E.gen(function* () {
								runFork(
									context.sendToBus(
										yield* attachRequestId(RequestState.Loading()),
									),
								);

								const response = yield* E.promise(() => runner());

								runFork(
									context.sendToBus(
										yield* attachRequestId(RequestState.Succeeded(response)),
									),
								);
							}).pipe(
								E.catchAllDefect(
									E.fn(function* (e) {
										runFork(
											context.sendToBus(
												yield* attachRequestId(RequestState.Failed(e)),
											),
										);
									}),
								),
							),
						);
					});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							/**
							 * 1. When we peel our envelope layer and get the
							 * RunRequest event back, we need to send it
							 * to the bus WITHOUT waiting for its result (use fork here)
							 * ALSO, The system will mark the event as if it was sent by us.
							 * */
							if (event instanceof WithCurrentRequestOverride) {
								runFork(context.sendToBus(event.peel()));
								return yield* context.next(event);
							}

							const isExecutionScheduledBySelf =
								event instanceof RunRequest && event.getDispatchedBy() === id;

							/**
							 * 2. If we detect that the event is sent by us,
							 * we need to immediately execute it, skipping all
							 * safety checks. This also makes sure that all
							 * currently supervised requests are interrupted.
							 * */
							if (isExecutionScheduledBySelf) {
								yield* runRequest(event);
								return yield* context.next(event);
							}

							/**
							 * 3. If we receive the RunRequest event that wasn't
							 * scheduled by us, we need to make sure that no other
							 * requests are running and ONLY THEN run our request.
							 * */
							if (
								event instanceof RunRequest &&
								!(yield* requestRunner.isRunning())
							) {
								yield* runRequest(event);
								return yield* context.next(event);
							}

							/**
							 * 4. If we receive the RunRequest event and our request
							 * is already running, we need to cancel the event.
							 * */
							if (
								event instanceof RunRequest &&
								(yield* requestRunner.isRunning())
							) {
								return yield* E.zipRight(event.cancel(), context.next(event));
							}

							if (event instanceof CancelRequest) {
								yield* requestRunner.interrupt();
								runFork(
									context.sendToBus(
										yield* attachRequestId(RequestState.Cancelled()),
									),
								);
								return yield* context.next(event);
							}

							return yield* context.next(event);
						});
					},
				} satisfies IEventBusListener;
			}).pipe(E.orDie),
) {}
