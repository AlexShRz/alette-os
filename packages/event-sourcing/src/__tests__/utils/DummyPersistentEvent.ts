import { Effect, gen } from "effect/Effect";
import { ICancellableEvent } from "../../contract/ICancellableEvent.js";
import { PersistentEvent } from "../../events/PersistentEvent.js";

export class DummyPersistentEvent
	extends PersistentEvent
	implements ICancellableEvent
{
	cancel() {
		this.wasCancelled = true;
		return this;
	}

	clone() {
		return gen(this, function* () {
			/**
			 * Make sure we keep event id the same for tests
			 * */
			return new DummyPersistentEvent(this.id);
		}) as Effect<this, never, never>;
	}
}
