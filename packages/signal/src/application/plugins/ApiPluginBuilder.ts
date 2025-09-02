import { ApiPlugin } from "./ApiPlugin.js";
import { IPluginRuntime } from "./defineApiPlugin.js";
import { CommandTaskBuilder } from "./tasks/primitive/CommandTaskBuilder";
import { QueryTaskBuilder } from "./tasks/primitive/QueryTaskBuilder";

export interface IApiPluginExposedUtils extends Record<string, unknown> {}

export interface IPluginActivationHookData {
	tell: <I>(task: CommandTaskBuilder<I>) => void;
	ask: <A, I>(task: QueryTaskBuilder<A, I>) => Promise<A>;
}

export interface IPluginActivationHook {
	(options: IPluginActivationHookData): void | Promise<void>;
}

export interface IPluginDeactivationHook {
	(options: IPluginActivationHookData): void | Promise<void>;
}

export interface IPluginUtilProvider<
	Utils extends IApiPluginExposedUtils = IApiPluginExposedUtils,
> {
	(): Utils;
}

export class ApiPluginBuilder<
	Utils extends IApiPluginExposedUtils = IApiPluginExposedUtils,
> {
	protected utilProvider: IPluginUtilProvider<Utils> = () => ({}) as Utils;
	protected activationHooks: IPluginActivationHook[] = [];
	protected deactivationHooks: IPluginDeactivationHook[] = [];

	constructor(
		protected config: {
			runtime: IPluginRuntime;
		},
	) {}

	exposes<NewExposedUtils extends IApiPluginExposedUtils>(
		provider: () => NewExposedUtils,
	): ApiPluginBuilder<NewExposedUtils> {
		this.utilProvider = provider as unknown as typeof this.utilProvider;
		return this as any;
	}

	onActivation(hook: (typeof this.activationHooks)[number]) {
		this.activationHooks.push(hook);
		return this;
	}

	onDeactivation(hook: (typeof this.deactivationHooks)[number]) {
		this.deactivationHooks.push(hook);
		return this;
	}

	build() {
		return new ApiPlugin<Utils>({
			runtime: this.config.runtime,
			activationHooks: [...this.activationHooks] as any,
			deactivationHooks: [...this.deactivationHooks] as any,
			getExposed: this.utilProvider as any,
		});
	}
}
