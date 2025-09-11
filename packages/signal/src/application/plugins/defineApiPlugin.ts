import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { ApiPluginBuilder } from "./ApiPluginBuilder.js";
import { PluginMailbox } from "./services/PluginMailbox";
import { PluginName } from "./services/PluginName";
import { PluginScope } from "./services/PluginScope";

export interface IPluginRuntime extends ReturnType<typeof createRuntime> {}

const createRuntime = (name: string) => {
	const PluginNameService = PluginName.Default(name);

	return ManagedRuntime.make(
		Layer.mergeAll(
			PluginScope.Default,
			PluginNameService,
			PluginMailbox.Default.pipe(Layer.provide(PluginNameService)),
		),
	);
};

export const defineApiPlugin = (name: string) => {
	const runtime = createRuntime(name);

	return {
		pluginName: name,
		pluginRuntime: runtime,
		plugin: new ApiPluginBuilder({
			name,
			runtime,
		}),
	};
};
