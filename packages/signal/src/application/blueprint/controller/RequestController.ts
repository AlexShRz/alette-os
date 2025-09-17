import { BusEvent } from "@alette/event-sourcing";
import * as Queue from "effect/Queue";
import { v4 as uuid } from "uuid";
import { IRequestContext } from "../../../domain/context/IRequestContext";
import { TRequestArguments } from "../../../domain/context/typeUtils/RequestIOTypes";
import { IRequestSessionSettingSupplier } from "../../../domain/execution/services/RequestSessionContext";
import { ApiPlugin } from "../../plugins/ApiPlugin";

export abstract class RequestController<
	Context extends IRequestContext = IRequestContext,
	State = unknown,
> {
	protected settingSupplier: IRequestSessionSettingSupplier | undefined;
	protected stateSubscribers: ((state: State) => void)[] = [];
	protected id = uuid();

	protected constructor(protected plugin: ApiPlugin) {}

	getId() {
		return this.id;
	}

	protected getSettingSupplier(settings: TRequestArguments<Context> = {}) {
		return !Object.keys(settings).length && this.settingSupplier
			? this.settingSupplier
			: () => settings;
	}

	abstract getState(): State;

	abstract getHandlers(): Record<string, any>;

	abstract getEventReceiver(): Queue.Queue<BusEvent>;

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

	abstract reload(): void;

	abstract dispose(): void;
}
