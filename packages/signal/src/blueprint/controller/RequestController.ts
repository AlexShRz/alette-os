import { BusEvent } from "@alette/event-sourcing";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Queue from "effect/Queue";
import * as Scope from "effect/Scope";

export abstract class RequestController<
	State = unknown,
	R = never,
	ER = never,
> {
	protected stateSubscribers: ((state: State) => void)[] = [];

	protected constructor(
		protected runtime: ManagedRuntime.ManagedRuntime<R, ER>,
	) {}

	abstract getInitialState(): any;

	abstract getScope(): Scope.CloseableScope;

	abstract getEventReceiver(): Queue.Queue<BusEvent>;

	subscribe(subscriber: (typeof this.stateSubscribers)[number]) {
		this.stateSubscribers = [...this.stateSubscribers, subscriber];
		return () => {
			this.stateSubscribers = this.stateSubscribers.filter(
				(sub) => sub !== subscriber,
			);
		};
	}

	abstract run(): void;

	abstract dispose(): void;
}
