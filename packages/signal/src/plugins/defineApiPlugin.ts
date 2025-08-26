import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { ApiPluginBuilder } from "./ApiPluginBuilder.js";
import { PluginMailbox } from "./PluginMailbox.js";
import { PluginName } from "./PluginName.js";

export interface IPluginRuntime extends ReturnType<typeof createRuntime> {}

const createRuntime = (name: string) => {
	const PluginNameService = PluginName.Default(name);

	return ManagedRuntime.make(
		Layer.mergeAll(
			PluginNameService,
			PluginMailbox.Default.pipe(Layer.provide(PluginNameService)),
		),
	);
};

export const defineApiPlugin = (name: string) => {
	const runtime = createRuntime(name);

	return {
		pluginName: name,
		plugin: new ApiPluginBuilder({
			runtime,
		}),
	};
};
