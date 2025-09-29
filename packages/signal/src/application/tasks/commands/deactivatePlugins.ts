import * as E from "effect/Effect";
import { ApiPlugin } from "../../plugins/ApiPlugin";
import { PluginRegistry } from "../../plugins/services/PluginRegistry";
import { task } from "../../plugins/tasks/primitive/functions";
import { asPluginTransaction } from "../utils/asPluginTransaction";

export const deactivatePlugins = (...plugins: ApiPlugin[]) =>
	task(
		asPluginTransaction(
			E.gen(function* () {
				const registry = yield* E.serviceOptional(PluginRegistry);

				for (const plugin of plugins) {
					const pluginName = plugin.getName();
					yield* registry.deactivate(pluginName);
				}
			}),
		),
	);
