import * as E from "effect/Effect";
import * as FiberSet from "effect/FiberSet";
import * as Scope from "effect/Scope";
import { PluginRegistry } from "../application/plugins/services/PluginRegistry";
import { RequestThreadRegistry } from "../domain/execution/RequestThreadRegistry";
import { TransactionManager } from "../domain/execution/services/TransactionManager";
import { GlobalUrlConfig } from "../domain/url/services/GlobalUrlConfig";

export class Kernel extends E.Service<Kernel>()("Kernel", {
	/**
	 * Here we need to include all services
	 * our tasks MIGHT need.
	 * */
	dependencies: [
		PluginRegistry.Default,
		GlobalUrlConfig.Default,
		RequestThreadRegistry.Default,
		TransactionManager.Default,
	],
	scoped: E.gen(function* () {
		const scope = yield* E.scope;
		const runtime = yield* E.runtime();
		const runningCommands = yield* FiberSet.make();

		return {
			runQuery<A, E, R>(query: E.Effect<A, E, R>) {
				return E.zipRight(
					FiberSet.awaitEmpty(runningCommands),
					query.pipe(E.provide(runtime), Scope.extend(scope)),
				);
			},

			runCommand<A, E, R>(command: E.Effect<A, E, R>) {
				return FiberSet.run(
					runningCommands,
					command.pipe(E.provide(runtime), Scope.extend(scope)),
				);
			},
		};
	}),
}) {}
