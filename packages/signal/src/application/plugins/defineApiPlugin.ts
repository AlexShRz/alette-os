import { ApiPluginBuilder } from "./ApiPluginBuilder.js";
import { PluginTaskScheduler } from "./PluginTaskScheduler";

export const defineApiPlugin = (name: string) => {
	return {
		pluginName: name,
		plugin: new ApiPluginBuilder({
			name,
			scheduler: new PluginTaskScheduler(name),
		}),
	};
};
