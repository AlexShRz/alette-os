import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Queue from "effect/Queue";
import * as Stream from "effect/Stream";
import { KernelTaskRunnerAvailability } from "./KernelTaskRunnerAvailability";
import { PluginRegistry } from "./plugins/registry/PluginRegistry.js";
import { Runnable } from "./runnable/Runnable";
import { TaskBuilder } from "./tasks/TaskBuilder.js";

export class KernelTaskRunner extends E.Service<KernelTaskRunner>()(
	"KernelTaskRunner",
	{
		dependencies: [
			PluginRegistry.Default,
			KernelTaskRunnerAvailability.Default,
		],
		scoped: E.gen(function* () {
			const context = yield* E.context<never>();
			const availability = yield* KernelTaskRunnerAvailability;
			const sequentialTasks = yield* Queue.unbounded<Runnable>();
			const mainRuntime = ManagedRuntime.make(Layer.succeedContext(context));

			yield* E.addFinalizer(() => mainRuntime.disposeEffect);

			/**
			 * Run each task in sequence, one by one:
			 * 1. Until a task is finished/failed, we cannot move on to the
			 * next one.
			 * */
			yield* Stream.fromQueue(sequentialTasks).pipe(
				Stream.runForEach((task) =>
					E.gen(function* () {
						task.spawn();
						yield* task.waitForCompletion();

						if (yield* sequentialTasks.isEmpty) {
							yield* availability.canProcessPluginTasks.open;
						}
					}),
				),
				E.forkScoped,
				Stream.runDrain,
			);

			return {
				schedule<A, I>(task: TaskBuilder<A, I>) {
					return E.gen(function* () {
						const runnable = task.executor(mainRuntime).build();

						if (runnable.isConcurrent()) {
							runnable.spawn();
							return runnable;
						}

						yield* availability.canProcessPluginTasks.close;
						yield* sequentialTasks.offer(runnable as unknown as Runnable);
						return runnable;
					});
				},
			};
		}),
	},
) {}
