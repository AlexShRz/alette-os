import { BusEvent, EventBus } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { RequestSessionEvent } from "../events/RequestSessionEvent";
import { RequestSession } from "../services/RequestSession";

/**
 * 1. Every request session events MUST be dispatched via this fn.
 * 2. It must provide current request id to them, otherwise the
 * whole program will crash.
 * */
export const sendSessionEvent = (event: RequestSessionEvent | BusEvent) =>
	E.gen(function* () {
		const bus = yield* E.serviceOptional(EventBus);

		if (!(event instanceof RequestSessionEvent)) {
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
