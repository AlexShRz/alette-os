import { BusEvent } from "@alette/event-sourcing";

export class ChooseRequestWorker extends BusEvent {
	constructor(
		protected config: {
			preferred: string;
			availableWorkerIds: string[];
		},
	) {
		super();
	}

	getPreferredWorker() {
		return this.config.preferred;
	}

	getAvailableWorkerIds() {
		return this.config.availableWorkerIds;
	}

	setPreferredWorker(workerId: string) {
		this.config.preferred = workerId;
		return this;
	}

	clone() {
		return new ChooseRequestWorker({ ...this.config }) as this;
	}
}
