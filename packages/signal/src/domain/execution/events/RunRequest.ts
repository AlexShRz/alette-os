import { BusEvent } from "@alette/event-sourcing";

export class RunRequest extends BusEvent {
	constructor() {
		super();
	}

	clone() {
		const event = new RunRequest() as this;
		return event;
	}
}
