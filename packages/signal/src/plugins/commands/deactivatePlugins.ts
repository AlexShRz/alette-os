import * as E from "effect/Effect";
import { task } from "../../tasks/functions.js";
import { ApiPlugin } from "../ApiPlugin.js";
import { PluginRegistry } from "../registry/PluginRegistry.js";

export const deactivatePlugins = (...plugins: ApiPlugin[]) =>
	task(() =>
		E.gen(function* () {
			const registry = yield* E.serviceOptional(PluginRegistry);

			for (const plugin of plugins) {
				const pluginName = yield* plugin.getName();
				yield* registry.deactivate(pluginName);
			}
		}),
	);
