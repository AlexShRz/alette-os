import { EventBus } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { RequestSessionEvent } from "../events/RequestSessionEvent";
import { TSessionEvent } from "../events/SessionEvent";
import { SessionEventEnvelope } from "../events/SessionEventEnvelope";
import { RequestSession } from "../services/RequestSession";

/**
 * 1. Every request session events MUST be dispatched via this fn.
 * 2. It must provide current request id to them, otherwise the
 * whole program will crash.
 * */
export const sendSessionEvent = <T extends TSessionEvent>(event: T) =>
	E.gen(function* () {
		const bus = yield* E.serviceOptional(EventBus);
		const isSessionRelated =
			event instanceof RequestSessionEvent ||
			event instanceof SessionEventEnvelope;

		if (!isSessionRelated) {
			return yield* bus.send(event);
		}

		const session = yield* E.serviceOptional(RequestSession);
		const requestId = yield* session.getRequestId();

		/**
		 * Set request id ONLY if the event doesn't have one already.
		 * */
		return yield* bus.send(
			event.hasRequestId() ? event : event.setRequestId(requestId),
		);
	}).pipe(E.orDie);
