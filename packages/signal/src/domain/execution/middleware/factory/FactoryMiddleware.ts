import { IEventBusListener } from "@alette/event-sourcing";
import { FatalApiError, RequestAbortedError } from "@alette/pulse";
import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import { orPanic } from "../../../errors/utils/orPanic";
import { panic } from "../../../errors/utils/panic";
import { OneShotRequestNotification } from "../../../lifecycle/notifications/OneShotRequestNotification";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { UrlContext } from "../../../preparation/context/url/UrlContext";
import { WithCurrentRequestOverride } from "../../events/envelope/WithCurrentRequestOverride";
import { AbortRequest } from "../../events/request/AbortRequest";
import { AutoRunRequest } from "../../events/request/AutoRunRequest";
import { CancelRequest } from "../../events/request/CancelRequest";
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
				const scope = yield* E.scope;

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

				const runRequest = (event: RunRequest | AutoRunRequest) =>
					E.gen(function* () {
						/**
						 * Complete the event first to make sure
						 * that our request context is filled
						 * */
						yield* event.complete();
						const fullContext = yield* requestContext.getSnapshot();
						const fullUrl = yield* getFullUrl;

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

								const response = yield* E.promise(async (signal) =>
									executor(
										{
											...fullContext,
											url: fullUrl,
										},
										{ notify: sendNotification, signal },
									),
								);

								runFork(
									context.sendToBus(
										yield* attachRequestId(RequestState.Succeeded(response)),
									),
								);
							}).pipe(
								E.catchAllDefect(
									E.fn(function* (e) {
										if (!(yield* requestRunner.isRunning())) {
											return;
										}

										if (e instanceof FatalApiError) {
											return yield* panic(e);
										}

										runFork(
											context.sendToBus(
												yield* attachRequestId(RequestState.Failed(e)),
											),
										);
									}),
								),
							),
						);
					}).pipe(E.forkIn(scope));

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							/**
							 * If we receive automatic run request event
							 * sent by a middleware we should run it only
							 * if we have no other requests in progress.
							 * */
							if (
								event instanceof AutoRunRequest &&
								!(yield* requestRunner.isRunning())
							) {
								yield* runRequest(event);
								return yield* context.next(event);
							}

							/**
							 * When we peel our envelope layer and get the
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
							 * If we detect that the event is sent by us,
							 * we need to immediately execute it, skipping all
							 * safety checks. This also makes sure that all
							 * currently supervised requests are interrupted.
							 * */
							if (isExecutionScheduledBySelf) {
								yield* runRequest(event);
								return yield* context.next(event);
							}

							/**
							 * If we receive the RunRequest event that wasn't
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
							 * If we receive the RunRequest event and our request
							 * is already running, we need to cancel the event.
							 * */
							if (
								event instanceof RunRequest &&
								(yield* requestRunner.isRunning())
							) {
								return yield* E.zipRight(event.cancel(), context.next(event));
							}

							if (
								event instanceof AbortRequest &&
								(yield* requestRunner.isRunning())
							) {
								yield* requestRunner.interrupt();
								runFork(
									context.sendToBus(
										yield* attachRequestId(
											RequestState.Failed(new RequestAbortedError()),
										),
									),
								);
								return yield* E.zipRight(event.complete(), context.next(event));
							}

							if (
								event instanceof CancelRequest &&
								(yield* requestRunner.isRunning())
							) {
								yield* requestRunner.interrupt();
								runFork(
									context.sendToBus(
										yield* attachRequestId(RequestState.Cancelled()),
									),
								);
								return yield* E.zipRight(event.complete(), context.next(event));
							}

							return yield* context.next(event);
						});
					},
				} satisfies IEventBusListener;
			}).pipe(orPanic),
) {}
