import { ICancellableEvent } from "../../contract/ICancellableEvent.js";
import { BusEvent } from "../../events/BusEvent.js";

export class DummyEvent
	extends BusEvent.extend<DummyEvent>("DummyEvent")({})
	implements ICancellableEvent
{
	cancel() {
		this.wasCancelled = true;
		return this;
	}

	clone() {
		return DummyEvent.make() as this;
	}
}
