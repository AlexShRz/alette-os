import { ApiPlugin } from "./ApiPlugin.js";
import { IPluginRuntime } from "./defineApiPlugin.js";
import { CommandTaskBuilder } from "./tasks/primitive/CommandTaskBuilder";
import { QueryTaskBuilder } from "./tasks/primitive/QueryTaskBuilder";

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

export class ApiPluginBuilder {
	protected activationHooks: IPluginActivationHook[] = [];
	protected deactivationHooks: IPluginDeactivationHook[] = [];

	constructor(
		protected config: {
			name: string;
			runtime: IPluginRuntime;
		},
	) {}

	onActivation(hook: (typeof this.activationHooks)[number]) {
		this.activationHooks.push(hook);
		return this;
	}

	onDeactivation(hook: (typeof this.deactivationHooks)[number]) {
		this.deactivationHooks.push(hook);
		return this;
	}

	build() {
		return new ApiPlugin({
			name: this.config.name,
			runtime: this.config.runtime,
			activationHooks: [...this.activationHooks] as any,
			deactivationHooks: [...this.deactivationHooks] as any,
		});
	}
}
