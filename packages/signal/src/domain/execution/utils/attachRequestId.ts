import * as E from "effect/Effect";
import { RequestSessionEvent } from "../events/RequestSessionEvent";
import { TSessionEvent } from "../events/SessionEvent";
import { SessionEventEnvelope } from "../events/SessionEventEnvelope";
import { RequestSession } from "../services/RequestSession";

export const attachRequestId = <T extends TSessionEvent>(event: T) =>
	E.gen(function* () {
		const isSessionRelated =
			event instanceof RequestSessionEvent ||
			event instanceof SessionEventEnvelope;

		if (!isSessionRelated) {
			return event;
		}

		const session = yield* E.serviceOptional(RequestSession);
		const requestId = yield* session.getRequestId();

		/**
		 * Set request id ONLY if the event doesn't have one already.
		 * */
		return (event.hasRequestId() ? event : event.setRequestId(requestId)) as T;
	}).pipe(E.orDie);
