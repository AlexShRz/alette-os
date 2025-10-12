import { v4 as uuid } from "uuid";
import { IRequestContext } from "../../../domain/context/IRequestContext";
import { TRequestSettings } from "../../../domain/context/typeUtils/RequestIOTypes";
import { IRequestSettingSupplier } from "../../../domain/execution/services/RequestSessionContext";
import { ApiPlugin } from "../../plugins/ApiPlugin";
import { RequestControllerState } from "./RequestControllerState";

export abstract class RequestController<
	Context extends IRequestContext = IRequestContext,
	State = unknown,
> {
	protected id = uuid();
	protected settingSupplier: IRequestSettingSupplier | undefined;

	protected constructor(protected plugin: ApiPlugin) {}

	getId() {
		return this.id;
	}

	protected getSettingSupplier(settings: TRequestSettings<Context> = {}) {
		return !Object.keys(settings).length && this.settingSupplier
			? this.settingSupplier
			: () => settings;
	}

	abstract getState(): State;

	abstract getHandlers(): Record<string, any>;

	abstract getStateManager(): RequestControllerState<State>;

	abstract subscribe(
		...params: Parameters<RequestControllerState<State>["subscribe"]>
	): () => void;

	setSettingSupplier(supplier: IRequestSettingSupplier) {
		this.settingSupplier = supplier;
		return this;
	}

	abstract reload(): void;

	abstract dispose(): void;
}
