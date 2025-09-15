import { EventInterceptorTag, TEventInterceptor } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { RequestSessionEvent } from "../events/RequestSessionEvent";
import { SessionEventEnvelope } from "../events/SessionEventEnvelope";
import { RunRequest } from "../events/request/RunRequest";
import { RequestSession } from "./RequestSession";

export class RequestEventInterceptor extends E.Service<RequestEventInterceptor>()(
	EventInterceptorTag,
	{
		scoped: E.gen(function* () {
			const session = yield* RequestSession;

			return ((event) =>
				E.gen(function* () {
					const isSessionRelated =
						event instanceof RequestSessionEvent ||
						event instanceof SessionEventEnvelope;

					/**
					 * If events are not session related,
					 * cancel them immediately
					 * */
					if (!isSessionRelated) {
						yield* event.cancel();
						return event;
					}

					const unwrappedEvent =
						event instanceof SessionEventEnvelope
							? (event.getWrappedEvent() as RequestSessionEvent)
							: event;

					const currentRequestId = yield* session.getRequestId();

					/**
					 * If we receive the "run request" command that already has a
					 * different request id from our session request id, it
					 * means that we want to start a new session (reload/refetch), and
					 * we need to make it pass.
					 * */
					const isStartingNewRequestSession =
						unwrappedEvent instanceof RunRequest &&
						unwrappedEvent.getRequestId() !== currentRequestId;

					if (isStartingNewRequestSession) {
						return event;
					}

					/**
					 * Cancel all "stray" events that might have been
					 * dispatched by request middleware, etc.
					 * */
					if (unwrappedEvent.getRequestId() !== currentRequestId) {
						/**
						 * Cancel the envelope, NOT
						 * the wrapped event.
						 * */
						yield* event.cancel();
					}

					/**
					 * Return the envelope back to the
					 * chain. Or the event itself if not wrapped.
					 * */
					return event;
				})) satisfies TEventInterceptor;
		}),
	},
) {}
