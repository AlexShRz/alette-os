import * as E from "effect/Effect";
import { queryTask } from "../../tasks/primitive/functions";
import { PluginRegistry } from "../registry/PluginRegistry.js";

export const forActivePlugins = () =>
	queryTask(() =>
		E.gen(function* () {
			const registry = yield* E.serviceOptional(PluginRegistry);
			return registry.getActivatedPluginNames();
		}).pipe(E.orDie),
	);
