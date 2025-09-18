import { BusEvent } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { ApiPlugin } from "../../plugins/ApiPlugin";

export abstract class RequestControllerState<State = unknown> {
	protected stateSubscribers: ((state: State) => void)[] = [];

	protected constructor(protected plugin: ApiPlugin) {}

	abstract getState(): State;

	abstract applyStateSnapshot(event: BusEvent): E.Effect<void>;

	subscribe(subscriber: (typeof this.stateSubscribers)[number]) {
		this.stateSubscribers = [...this.stateSubscribers, subscriber];
		return () => {
			this.stateSubscribers = this.stateSubscribers.filter(
				(sub) => sub !== subscriber,
			);
		};
	}
}
