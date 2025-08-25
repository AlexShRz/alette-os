import * as E from "effect/Effect";
import { task } from "../../tasks/functions.js";
import { ApiPlugin } from "../ApiPlugin.js";
import { PluginRegistry } from "../registry/PluginRegistry.js";

export const activatePlugins = (...plugins: ApiPlugin[]) =>
	task(() =>
		E.gen(function* () {
			const registry = yield* E.serviceOptional(PluginRegistry);

			for (const plugin of plugins) {
				const pluginName = yield* plugin.getName();

				/**
				 * If we already have a plugin with the same name,
				 * deactivate it and activate it again.
				 * */
				if (registry.has(pluginName)) {
					yield* registry.deactivate(pluginName);
				}

				yield* registry.activate(plugin);
			}
		}),
	);
