import { EventBus } from "@alette/event-sourcing";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as FiberSet from "effect/FiberSet";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { RequestInterruptedException } from "../../../shared/exception/RequestInterruptedException";
import { IRequestContext } from "../../context/IRequestContext";
import { ApplyRequestState } from "../events/request/ApplyRequestState";
import { RequestState } from "../events/request/RequestState";
import { IOneShotRequestState } from "../state/IOneShotRequestState";
import { RequestSession } from "./RequestSession";

export class RequestStateTimeline extends Context.Tag("RequestStateTimeline")<
	RequestStateTimeline,
	{
		broadcast(): Stream.Stream<ApplyRequestState>;
		/**
		 * 1. Can be used to replay the whole timeline to an abstract receiver.
		 * 2. Usually used to replay state events for watchers that are
		 * attached late while the request is already in progress.
		 * This way we can sync state to watchers, no matter WHEN they were
		 * attached to the request.
		 * */
		replay(
			receiver: <T extends ApplyRequestState>(event: T) => E.Effect<void>,
		): E.Effect<void>;
		/**
		 * Used for persisting events
		 * */
		record<
			T extends ApplyRequestState<IRequestContext, IOneShotRequestState.Any>,
		>(event: T): E.Effect<void>;
	}
>() {
	private static parent() {
		return E.gen(function* () {
			const session = yield* RequestSession;
			const lastStateEvent =
				yield* SubscriptionRef.make<ApplyRequestState | null>(null);
			const replays = yield* FiberSet.make();

			yield* session.getRequestIdChanges().pipe(
				/**
				 * The moment request id changes, we
				 * need to reset all persisted events and start anew.
				 * */
				Stream.tap(() =>
					E.zipRight(
						/**
						 * 1. Wait for all replays to complete to
						 * avoid state desynchronization
						 * */
						FiberSet.awaitEmpty(replays),
						/**
						 * 2. Reset all persisted events and start anew.
						 * */
						SubscriptionRef.set(lastStateEvent, null),
					),
				),
				Stream.runDrain,
				E.forkScoped,
			);

			return {
				session,
				lastStateEvent,
				replays,
				parent: {
					/**
					 * IMPORTANT:
					 * 1. We need to start broadcasting changes ONLY when our
					 * replays are over, otherwise event sets might collide
					 * with one another.
					 * 2. We must not broadcast "null" if we have no
					 * last state event set.
					 * */
					broadcast() {
						return lastStateEvent.changes.pipe(
							Stream.filter((event) => !!event),
							Stream.mapEffect((event) =>
								E.zipRight(FiberSet.awaitEmpty(replays), E.succeed(event)),
							),
						);
					},

					/**
					 * 1. We might spawn a lot of replays
					 * in parallel.
					 * 2. For example, 10000 watchers === 10000 replays
					 * */
					replay(receiver) {
						return E.gen(function* () {
							const lastEvent = yield* SubscriptionRef.get(lastStateEvent);

							if (!lastEvent) {
								return;
							}

							yield* FiberSet.run(replays, receiver(lastEvent));
						});
					},
				} satisfies Partial<RequestStateTimeline["Type"]>,
			};
		});
	}

	static make() {
		return Layer.scoped(
			this,
			E.gen(function* () {
				const { parent, lastStateEvent } = yield* RequestStateTimeline.parent();

				const recordEvent: RequestStateTimeline["Type"]["record"] = (event) =>
					SubscriptionRef.getAndUpdateEffect(
						lastStateEvent,
						E.fn(function* (lastEvent) {
							if (!(event instanceof ApplyRequestState)) {
								return lastEvent;
							}

							const defaultState: IOneShotRequestState.Any = {
								...(lastEvent?.getState() || {}),
							};

							/**
							 * 1. Do not change "data" or "error" props here.
							 * 2. This approach allows for "stale-while-revalidate"
							 * pattern to be applied.
							 * */
							if (RequestState.isLoading(event)) {
								return new ApplyRequestState<
									IRequestContext,
									IOneShotRequestState.Loading
								>({
									...defaultState,
									isLoading: true,
									isUninitialized: false,
								});
							}

							if (RequestState.isInterrupted(event)) {
								return new ApplyRequestState<
									IRequestContext,
									IOneShotRequestState.Interrupted
								>({
									...defaultState,
									isLoading: false,
									isSuccess: false,
									isUninitialized: false,
									isError: true,
									data: null,
									error: new RequestInterruptedException(),
								});
							}

							if (RequestState.isUninitialized(event)) {
								return new ApplyRequestState<
									IRequestContext,
									IOneShotRequestState.Uninitialized
								>({
									...defaultState,
									isLoading: false,
									isError: false,
									isSuccess: true,
									isUninitialized: true,
									data: null,
									error: null,
								});
							}

							if (RequestState.isSuccess(event)) {
								const { data } = event.getState();

								return new ApplyRequestState<
									IRequestContext,
									IOneShotRequestState.Success
								>({
									...defaultState,
									isLoading: false,
									isError: false,
									isSuccess: true,
									isUninitialized: false,
									data: data!,
									error: null,
								});
							}

							if (RequestState.isFailure(event)) {
								return new ApplyRequestState<
									IRequestContext,
									IOneShotRequestState.Failure
								>({
									...defaultState,
									isLoading: false,
									isSuccess: false,
									isUninitialized: false,
									isError: true,
									data: null,
									error: event.getError(),
								});
							}

							/**
							 * Cancelled
							 * 1. Reset the "loading" prop, but that's it.
							 * 2. Success/Failure state must be preserved.
							 * */
							return new ApplyRequestState<
								IRequestContext,
								IOneShotRequestState.Cancelled
							>({
								...defaultState,
								isLoading: false,
								isUninitialized: false,
							});
						}),
					);

				/**
				 * Aggregate related state events
				 * */
				const middlewareEventBus = yield* EventBus;
				middlewareEventBus.broadcast((e) =>
					E.gen(function* () {
						if (e instanceof ApplyRequestState) {
							yield* recordEvent(e);
						}
					}),
				);

				return {
					...parent,
					record: recordEvent,
				};
			}),
		);
	}
}
