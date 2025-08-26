import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import { PluginRegistry } from "./plugins/registry/PluginRegistry";
import { TaskScheduler } from "./tasks/TaskScheduler";

export class KernelTaskRunner extends E.Service<KernelTaskRunner>()(
	"KernelTaskRunner",
	{
		dependencies: [PluginRegistry.Default, TaskScheduler.Default],
		scoped: E.gen(function* () {
			const taskScheduler = yield* TaskScheduler;

			/**
			 * Run each task in sequence, one by one:
			 * 1. Until a task is finished/failed, we cannot move on to the
			 * next one.
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
	},
) {}
