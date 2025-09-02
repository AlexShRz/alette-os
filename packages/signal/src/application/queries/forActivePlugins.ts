import * as E from "effect/Effect";
import { PluginRegistry } from "../plugins/registry/PluginRegistry";
import { queryTask } from "../plugins/tasks/primitive/functions";

export const forActivePlugins = () =>
	queryTask(() =>
		E.gen(function* () {
			const registry = yield* E.serviceOptional(PluginRegistry);
			return registry.getActivatedPluginNames();
		}).pipe(E.orDie),
	);
