import { BusEvent } from "@alette/event-sourcing";
import { v4 as uuid } from "uuid";

export abstract class RequestSessionEvent extends BusEvent {
	protected requestId: string | null = null;

	constructor() {
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

	unsafeGetRequestId() {
		return this.requestId;
	}

	setRequestId(id?: string) {
		this.requestId = id || uuid();
		return this;
	}

	protected abstract _clone(): this;

	clone() {
		const self = this._clone();
		self.requestId = this.requestId;
		return self;
	}
}
