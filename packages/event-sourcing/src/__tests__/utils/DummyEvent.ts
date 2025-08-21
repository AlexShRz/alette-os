import { BusEvent } from "../../events/BusEvent.js";

export class DummyEvent extends BusEvent {
	clone() {
		return new DummyEvent() as this;
	}
}
