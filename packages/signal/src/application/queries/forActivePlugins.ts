import * as E from "effect/Effect";
import { asPluginTransaction } from "../commands/utils/asPluginTransaction";
import { PluginRegistry } from "../plugins/services/PluginRegistry";
import { queryTask } from "../plugins/tasks/primitive/functions";

export const forActivePlugins = () =>
	queryTask(
		asPluginTransaction(
			E.gen(function* () {
				const registry = yield* E.serviceOptional(PluginRegistry);
				return yield* registry.getActivatedPluginNames();
			}),
		).pipe(E.orDie),
	);
