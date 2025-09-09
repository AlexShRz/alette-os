import { v4 as uuid } from "uuid";
import { BusEvent } from "../events/BusEvent";

export class DummyEvent extends BusEvent {
	constructor(
		protected values: number[] = [23],
		id = uuid(),
	) {
		super(id);
	}

	getValues() {
		return this.values;
	}

	setValues(newValues: number[]) {
		this.values = [...newValues];
		return this;
	}

	clone() {
		return new DummyEvent() as this;
	}
}
