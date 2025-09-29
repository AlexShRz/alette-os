import * as E from "effect/Effect";
import { RequestThreadRegistry } from "../../../../domain/execution/RequestThreadRegistry";
import { PluginRegistry } from "../../../plugins/services/PluginRegistry";

export const getAllThreadRegistries = E.gen(function* () {
	const pluginRegistry = yield* E.serviceOptional(PluginRegistry);
	const allPlugins = yield* pluginRegistry.getAll();

	const threadRegistries: RequestThreadRegistry[] = [];
	for (const plugin of allPlugins) {
		threadRegistries.push(plugin.getThreads());
	}

	return threadRegistries;
}).pipe(E.orDie, E.scoped);
