import * as E from "effect/Effect";
import { ApiPlugin } from "../plugins/ApiPlugin";
import { PluginRegistry } from "../plugins/registry/PluginRegistry";
import { task } from "../plugins/tasks/primitive/functions";

export const activatePlugins = (...plugins: ApiPlugin[]) =>
	task(() =>
		E.gen(function* () {
			const registry = yield* E.serviceOptional(PluginRegistry);

			for (const plugin of plugins) {
				const pluginName = plugin.getName();

				/**
				 * If we already have a plugin with the same name,
				 * deactivate it and activate it again.
				 * */
				if (registry.has(pluginName)) {
					yield* registry.deactivate(pluginName);
				}

				yield* registry.activate(plugin);
			}

			return true;
		}).pipe(E.orDie),
	);
