import { BusEvent } from "@alette/event-sourcing";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Queue from "effect/Queue";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";

export abstract class RequestControllerState<State, R, ER> {
	/**
	 * State related
	 * */
	protected state: SubscriptionRef.SubscriptionRef<State | null>;
	protected eventReceiver: Queue.Queue<BusEvent>;

	protected constructor(
		protected runtime: ManagedRuntime.ManagedRuntime<R, ER>,
	) {
		this.state = this.runtime.runSync(SubscriptionRef.make<State | null>(null));
		this.eventReceiver = this.runtime.runSync(Queue.unbounded<BusEvent>());
	}

	abstract getInitialStateSnapshot(): State;

	getStateEventReceiver() {
		return this.eventReceiver;
	}

	changes() {
		return this.state.changes.pipe(Stream.filter((value) => value !== null));
	}
}
