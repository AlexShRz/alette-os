import * as E from "effect/Effect";
import { PluginRegistry } from "../../plugins/services/PluginRegistry";
import { queryTask } from "../../plugins/tasks/primitive/functions";
import { asPluginTransaction } from "../utils/asPluginTransaction";

export const forActivePlugins = () =>
	queryTask(
		asPluginTransaction(
			E.gen(function* () {
				const registry = yield* E.serviceOptional(PluginRegistry);
				return yield* registry.getActivatedPluginNames();
			}),
		).pipe(E.orDie),
	);
