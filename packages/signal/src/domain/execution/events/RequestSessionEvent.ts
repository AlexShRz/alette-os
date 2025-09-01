import { BusEvent } from "@alette/event-sourcing";

export abstract class RequestSessionEvent extends BusEvent {
	constructor(protected requestId: string) {
		super();
	}

	getRequestId() {
		return this.requestId;
	}
}
