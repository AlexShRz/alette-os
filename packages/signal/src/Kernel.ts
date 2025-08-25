import * as E from "effect/Effect";
import { KernelTaskRunner } from "./KernelTaskRunner";
import { TaskBuilder } from "./tasks/TaskBuilder.js";

export class Kernel extends E.Service<Kernel>()("Kernel", {
	dependencies: [KernelTaskRunner.Default],
	scoped: E.gen(function* () {
		const taskRunner = yield* KernelTaskRunner;

		return {
			run<A, I>(task: TaskBuilder<A, I>) {
				return taskRunner.schedule(task);
			},
		};
	}),
}) {}
