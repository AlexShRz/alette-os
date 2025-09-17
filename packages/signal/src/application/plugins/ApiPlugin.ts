import {
	IPluginActivationHook,
	IPluginDeactivationHook,
} from "./ApiPluginBuilder.js";
import { PluginTaskScheduler } from "./PluginTaskScheduler";
import { ApiPluginServices } from "./services/activation/ApiPluginServices";

export class ApiPlugin {
	constructor(
		protected config: {
			name: string;
			scheduler: PluginTaskScheduler;
			activationHooks: IPluginDeactivationHook[];
			deactivationHooks: IPluginActivationHook[];
		},
	) {}

	getName() {
		return this.config.name;
	}

	/** @internal  */
	getScheduler() {
		return this.config.scheduler;
	}

	/** @internal  */
	getServiceInjector() {
		const { name, scheduler, deactivationHooks, activationHooks } = this.config;

		return new ApiPluginServices({
			pluginName: name,
			scheduler,
			activationHooks,
			deactivationHooks,
		});
	}
}
