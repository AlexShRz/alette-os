import { EventBus } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { TSessionEvent } from "../events/SessionEvent";
import { attachRequestId } from "./attachRequestId";

/**
 * 1. Every request session events MUST be dispatched via this fn.
 * 2. It must provide current request id to them, otherwise the
 * whole program will crash.
 * */
export const sendSessionEvent = <T extends TSessionEvent>(event: T) =>
	E.gen(function* () {
		const bus = yield* E.serviceOptional(EventBus);
		const configuredEvent = yield* attachRequestId(event);
		return yield* bus.send(configuredEvent);
	}).pipe(E.orDie);
