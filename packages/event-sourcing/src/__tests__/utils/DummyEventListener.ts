import { Effect, gen } from "effect/Effect";
import { BusEvent } from "../../events/BusEvent.js";
import {
	BusEventListener,
	BusEventListenerContext,
} from "../../listeners/BusEventListener.js";

export class DummyEventListener extends BusEventListener {
	protected apply(event: BusEvent, { next }: BusEventListenerContext) {
		return next(event);
	}

	clone() {
		return gen(function* () {
			return new DummyEventListener();
		}) as Effect<this, never, never>;
	}
}
