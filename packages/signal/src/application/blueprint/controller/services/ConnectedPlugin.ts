import * as E from "effect/Effect";
import { PluginScope } from "../../../plugins/services/PluginScope";

export class ConnectedPlugin extends E.Service<ConnectedPlugin>()(
	"ConnectedPlugin",
	{
		scoped: E.gen(function* () {
			/**
			 * 1. Make sure we scope any forked fiber
			 * using this scope.
			 * 2. This makes sure that when our plugin deactivates,
			 * all fibers will be interrupted
			 * */
			const pluginScope = yield* PluginScope.get();

			return {
				getScope() {
					return pluginScope;
				},
			};
		}),
	},
) {}
