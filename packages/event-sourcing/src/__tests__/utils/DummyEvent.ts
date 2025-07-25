import { Effect, gen } from "effect/Effect";
import { ICancellableEvent } from "../../contract/ICancellableEvent.js";
import { BusEvent } from "../../events/BusEvent.js";

export class DummyEvent extends BusEvent implements ICancellableEvent {
	cancel() {
		this.wasCancelled = true;
		return this;
	}

	clone() {
		return gen(function* () {
			return new DummyEvent();
		}) as Effect<this, never, never>;
	}
}
