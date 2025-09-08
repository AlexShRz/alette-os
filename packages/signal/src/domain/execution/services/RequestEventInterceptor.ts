import { EventInterceptorTag, TEventInterceptor } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { RequestSessionEvent } from "../events/RequestSessionEvent";
import { SessionEventEnvelope } from "../events/SessionEventEnvelope";
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
					 * 1. Cancel all "stray" events that might have been
					 * dispatched by request middleware, etc.
					 * */
					if (unwrappedEvent.getRequestId() !== currentRequestId) {
						/**
						 * 2. Cancel the envelope, NOT
						 * the wrapped event.
						 * */
						yield* event.cancel();
					}

					/**
					 * 3. Return the envelope back to the
					 * chain. Or the event itself if not wrapped.
					 * */
					return event;
				})) satisfies TEventInterceptor;
		}),
	},
) {}
