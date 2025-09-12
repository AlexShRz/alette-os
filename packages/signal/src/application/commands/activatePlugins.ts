import * as E from "effect/Effect";
import * as Scope from "effect/Scope";
import { ApiPlugin } from "../plugins/ApiPlugin";
import { PluginRegistry } from "../plugins/services/PluginRegistry";
import { task } from "../plugins/tasks/primitive/functions";
import { asPluginTransaction } from "./utils/asPluginTransaction";

export const activatePlugins = (...plugins: ApiPlugin[]) =>
	task(() =>
		asPluginTransaction(
			E.gen(function* () {
				const registry = yield* E.serviceOptional(PluginRegistry);

				for (const plugin of plugins) {
					const ref = yield* plugin.getOrCreatePluginRef();
					yield* registry.activate(ref).pipe(Scope.extend(ref.getScope()));
				}

				return true;
			}),
		).pipe(E.orDie),
	);
