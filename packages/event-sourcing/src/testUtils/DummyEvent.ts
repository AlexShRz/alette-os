import { BusEvent } from "../events/BusEvent";

export class DummyEvent extends BusEvent {
	clone() {
		return new DummyEvent() as this;
	}
}
