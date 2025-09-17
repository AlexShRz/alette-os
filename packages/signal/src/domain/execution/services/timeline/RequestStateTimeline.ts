import { EventBus } from "@alette/event-sourcing";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as FiberSet from "effect/FiberSet";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { IRequestContext } from "../../../context/IRequestContext";
import { ApplyRequestState } from "../../events/request/ApplyRequestState";
import { IOneShotRequestState } from "../../state/IOneShotRequestState";
import { attachRequestId } from "../../utils/attachRequestId";
import { RequestSession } from "../RequestSession";
import { toNextOneShotRequestState } from "./toNextOneShotRequestState";

export class RequestStateTimeline extends Context.Tag("RequestStateTimeline")<
	RequestStateTimeline,
	{
		updates(): Stream.Stream<ApplyRequestState>;
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
			/**
			 * 1. Persistent events and replays MUST NOT
			 * be reset if our request id changes.
			 * 2. State is determined based on prev + current events,
			 * so they should always be persisted.
			 * */
			const lastStateEvent =
				yield* SubscriptionRef.make<ApplyRequestState | null>(null);
			const replays = yield* FiberSet.make();

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
					updates() {
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
							const nextEvent = toNextOneShotRequestState(lastEvent, event);

							if (!nextEvent) {
								return lastEvent;
							}

							/**
							 * Make sure to attach request id before
							 * updating state
							 * */
							return yield* attachRequestId(nextEvent);
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
