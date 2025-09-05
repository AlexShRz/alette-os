import { BusEvent } from "@alette/event-sourcing";
import { RequestWatcher } from "../../../watchers/RequestWatcher";

export class AggregateRequestWatchers extends BusEvent {
	constructor(protected aggregatedWatchers: RequestWatcher[] = []) {
		super();
	}

	getWatchers() {
		return this.aggregatedWatchers;
	}

	setWatchers(watchers: typeof this.aggregatedWatchers) {
		this.aggregatedWatchers = [...watchers];
		return this;
	}

	clone() {
		const event = new AggregateRequestWatchers() as this;
		event.aggregatedWatchers = [...this.aggregatedWatchers];
		return event;
	}
}
