import { Predicate } from "effect";
import { ICancellableEvent } from "../contract/contract.js";
import { BusEvent } from "../events/BusEvent.js";

export const canEventBeCancelled = (
	event: unknown,
): event is ICancellableEvent =>
	event instanceof BusEvent &&
	Predicate.hasProperty(event, "isCancelled") &&
	Predicate.hasProperty(event, "cancel") &&
	Predicate.isFunction((event as ICancellableEvent).isCancelled);

export const wasEventCancelled = (event: unknown) =>
	canEventBeCancelled(event) && event.isCancelled();
