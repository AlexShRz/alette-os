import { BusEvent } from "@alette/event-sourcing";

export abstract class RequestSessionEvent extends BusEvent {
	protected requestId: string | null = null;

	protected constructor() {
		super();
	}

	hasRequestId() {
		return this.requestId !== null;
	}

	getRequestId() {
		if (!this.requestId) {
			throw new Error("[RequestSessionEvent] - request id was not provided");
		}

		return this.requestId;
	}

	setRequestId(id: string) {
		this.requestId = id;
		return this;
	}
}
