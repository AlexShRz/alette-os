import { BusEvent } from "@alette/event-sourcing";
import { RequestMiddleware } from "../../../middleware/RequestMiddleware";

export class AggregateRequestMiddleware extends BusEvent {
	constructor(protected aggregatedMiddleware: RequestMiddleware[] = []) {
		super();
	}

	getMiddleware() {
		return this.aggregatedMiddleware;
	}

	setMiddleware<T extends RequestMiddleware>(middleware: T[]) {
		this.aggregatedMiddleware = [...middleware];
		return this;
	}

	addMiddleware<T extends RequestMiddleware>(middleware: T) {
		this.aggregatedMiddleware = [...this.aggregatedMiddleware, middleware];
		return this;
	}

	clone() {
		const event = new AggregateRequestMiddleware() as this;
		event.aggregatedMiddleware = [...this.aggregatedMiddleware];
		return event;
	}
}
