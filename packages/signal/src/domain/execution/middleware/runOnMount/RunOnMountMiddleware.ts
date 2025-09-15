import { TMaybeWrappedEvent } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { WithReloadableCheck } from "../../events/envelope/WithReloadableCheck";
import { WithRunOnMountCheck } from "../../events/envelope/WithRunOnMountCheck";
import { RunRequest } from "../../events/request/RunRequest";
import { RequestMetrics } from "../../services/RequestMetrics";
import { RequestMode } from "../../services/RequestMode";

export class RunOnMountMiddleware extends Middleware("RunOnMountMiddleware", {
	priority: MiddlewarePriority.BeforeCreation,
})(
	(isEnabled = true) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestMode = yield* E.serviceOptional(RequestMode);
				const metrics = yield* E.serviceOptional(RequestMetrics);
				/**
				 * 1. We do not care about request id here.
				 * 2. In mount mode, the moment we process our first "run request"
				 * event, we mark the request middleware tree as fully "mounted".
				 * 3. After that, each request sent to the same tree
				 * is considered to be of the "refetch" type, not "mount".
				 * */
				const hasProcessedFirstMountRequest =
					yield* SynchronizedRef.make(false);

				const addReloadableCheck = <T extends TMaybeWrappedEvent<RunRequest>>(
					event: T,
				) => {
					/**
					 * Make sure we do not wrap the event twice
					 * */
					if (event instanceof WithReloadableCheck) {
						return event;
					}

					if (event instanceof RunRequest) {
						return new WithReloadableCheck(event);
					}

					return event;
				};

				const processEventUsingDisabledMode = E.fn(function* (
					runRequestCommand: TMaybeWrappedEvent<RunRequest>,
				) {
					if (yield* hasProcessedFirstMountRequest.get) {
						return yield* context.next(addReloadableCheck(runRequestCommand));
					}

					/**
					 * In disabled mode we do not run mounted requests,
					 * so we have to cancel it here.
					 * */
					yield* SynchronizedRef.set(hasProcessedFirstMountRequest, true);
					return yield* E.zipRight(
						runRequestCommand.cancel(),
						context.next(runRequestCommand),
					);
				});

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							/**
							 * If we are in the "oneShot" mode
							 * we need to ignore all mount checks
							 * */
							const shouldSkipValidation =
								!(event instanceof WithRunOnMountCheck) ||
								requestMode.isOneShot();

							if (shouldSkipValidation) {
								return yield* context.next(event);
							}

							/**
							 * Peel the envelope layer
							 * */
							const nextEvent = event.peel();

							if (!isEnabled) {
								return yield* processEventUsingDisabledMode(nextEvent);
							}

							const amountOfExecutionsAcrossRequests =
								yield* metrics.getAmountOfAttemptsAcrossRequests();

							/**
							 * If our request hasn't been executed yet,
							 * peel the envelope and send the event downstream
							 * */
							if (!amountOfExecutionsAcrossRequests) {
								return yield* context.next(nextEvent);
							}

							/**
							 * Otherwise, wrap it in reloadable check and send
							 * it downstream
							 * */
							return yield* context.next(addReloadableCheck(nextEvent));
						});
					},
				};
			}),
) {}
