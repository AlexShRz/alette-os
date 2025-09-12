import { BusEvent } from "@alette/event-sourcing";
import * as Queue from "effect/Queue";
import * as Scope from "effect/Scope";
import { v4 as uuid } from "uuid";
import { IRequestSessionSettingSupplier } from "../../../domain/execution/services/RequestSessionContext";
import { ApiPlugin } from "../../plugins/ApiPlugin";

export abstract class RequestController<State = unknown> {
	protected settingSupplier: IRequestSessionSettingSupplier | undefined;
	protected stateSubscribers: ((state: State) => void)[] = [];
	protected id = uuid();

	protected constructor(protected plugin: ApiPlugin) {}

	getId() {
		return this.id;
	}

	abstract getState(): State;

	abstract getHandlers(): Record<string, any>;

	abstract getScope(): Scope.CloseableScope;

	abstract getEventReceiver(): Queue.Queue<BusEvent>;

	getSettingSupplier() {
		return this.settingSupplier;
	}

	subscribe(subscriber: (typeof this.stateSubscribers)[number]) {
		this.stateSubscribers = [...this.stateSubscribers, subscriber];
		return () => {
			this.stateSubscribers = this.stateSubscribers.filter(
				(sub) => sub !== subscriber,
			);
		};
	}

	setSettingSupplier(supplier: IRequestSessionSettingSupplier) {
		this.settingSupplier = supplier;
		return this;
	}

	abstract run(): void;

	abstract dispose(): void;
}
