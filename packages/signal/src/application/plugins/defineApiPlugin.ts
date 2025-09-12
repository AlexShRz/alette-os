import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { ApiPluginBuilder } from "./ApiPluginBuilder.js";
import { PluginMailbox } from "./services/PluginMailbox";
import { PluginName } from "./services/PluginName";
import { PluginLifecycle } from "./services/ref/PluginLifecycle";

export interface IPluginRuntime extends ReturnType<typeof createRuntime> {}

const createRuntime = (name: string) => {
	const PluginNameService = PluginName.Default(name);

	return ManagedRuntime.make(
		Layer.mergeAll(
			PluginNameService,
			PluginLifecycle.Default.pipe(Layer.provide(PluginNameService)),
			PluginMailbox.Default.pipe(Layer.provide(PluginNameService)),
		),
	);
};

export const defineApiPlugin = (name: string) => {
	return {
		pluginName: name,
		plugin: new ApiPluginBuilder({
			name,
			runtime: createRuntime(name),
		}),
	};
};
