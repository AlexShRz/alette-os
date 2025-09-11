import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import { PluginRegistry } from "../application/plugins/services/PluginRegistry";
import { TaskScheduler } from "../application/plugins/tasks/TaskScheduler";
import { GlobalContext } from "../domain/context/services/GlobalContext";
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
		TaskScheduler.Default,
		RequestThreadRegistry.Default,
		GlobalContext.Default,
		GlobalUrlConfig.Default,
		TransactionManager.Default,
	],
	scoped: E.gen(function* () {
		const taskScheduler = yield* TaskScheduler;

		/**
		 * Run each task in sequence, one by one:
		 * 1. Until a task is finished/failed, we cannot move on to the
		 * next one.
		 * 2. Next concurrent tasks MUST WAIT if we are running a sync
		 * task at the moment.
		 * */
		yield* taskScheduler.take().pipe(
			Stream.runForEach((task) =>
				E.gen(function* () {
					yield* task.spawn();

					if (task.isSequential()) {
						yield* task.waitForCompletion();
					}
				}),
			),
			E.forkScoped,
			Stream.runDrain,
		);

		return {};
	}),
}) {}
