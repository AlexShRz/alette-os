import { hasProperty, isFunction } from 'effect/Predicate';
import {Event} from "../Event.js";
import {ICancellableEvent} from "../../contract/ICancellableEvent.js";

export const canEventBeCancelled = (event: unknown): event is ICancellableEvent => event instanceof Event && hasProperty(event, 'isCancelled') && isFunction((event as { isCancelled: unknown }).isCancelled);

// export const wasEventCancelled = (event: unknown): event is ICancellableEvent => event instanceof Event && Predicate.hasProperty(event, '')