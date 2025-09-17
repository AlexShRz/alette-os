import { BusEvent } from "@alette/event-sourcing";
import * as Queue from "effect/Queue";
import { ApiPlugin } from "../../plugins/ApiPlugin";

export abstract class RequestControllerState<State> {
	protected eventReceiver: Queue.Queue<BusEvent>;

	protected constructor(protected plugin: ApiPlugin) {
		this.eventReceiver = this.plugin
			.getScheduler()
			.runSync(Queue.unbounded<BusEvent>());
	}

	abstract getState(): State;

	getStateEventReceiver() {
		return this.eventReceiver;
	}
}
