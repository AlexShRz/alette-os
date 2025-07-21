import { ICancellableEvent } from "../../contract/ICancellableEvent.js";
import { PersistentEvent } from "../../events/PersistentEvent.js";

export class DummyPersistentEvent
	extends PersistentEvent.extend<DummyPersistentEvent>("DummyPersistentEvent")(
		{},
	)
	implements ICancellableEvent
{
	cancel() {
		this.wasCancelled = true;
		return this;
	}

	clone() {
		return DummyPersistentEvent.make({
			/**
			 * Make sure we keep event id the same for tests
			 * */
			id: this.id,
		}) as this;
	}
}
