import { BusEvent } from "@alette/event-sourcing";
import { RequestMiddleware } from "../../middleware/RequestMiddleware";

export class AggregateRequestMiddleware extends BusEvent {
	constructor(protected aggregatedMiddleware: RequestMiddleware[] = []) {
		super();
	}

	getMiddleware() {
		return this.aggregatedMiddleware;
	}

	setMiddleware(middleware: typeof this.aggregatedMiddleware) {
		this.aggregatedMiddleware = [...middleware];
		return this;
	}

	addMiddleware(middleware: (typeof this.aggregatedMiddleware)[number]) {
		this.aggregatedMiddleware = [...this.aggregatedMiddleware, middleware];
		return this;
	}

	clone() {
		const event = new AggregateRequestMiddleware() as this;
		event.aggregatedMiddleware = [...this.aggregatedMiddleware];
		return event;
	}
}
