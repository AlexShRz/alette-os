import { BusEvent } from "@alette/event-sourcing";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Queue from "effect/Queue";

export abstract class RequestControllerState<State, R, ER> {
	protected eventReceiver: Queue.Queue<BusEvent>;

	protected constructor(
		protected runtime: ManagedRuntime.ManagedRuntime<R, ER>,
	) {
		this.eventReceiver = this.runtime.runSync(Queue.unbounded<BusEvent>());
	}

	abstract getState(): State;

	getStateEventReceiver() {
		return this.eventReceiver;
	}
}
