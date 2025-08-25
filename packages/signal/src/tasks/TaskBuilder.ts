import * as E from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { IRunnableMode, Runnable } from "../runnable/Runnable.js";

export interface IAcceptedTaskRuntime<A, I>
	extends ManagedRuntime.ManagedRuntime<A, I> {}

export class TaskBuilder<
	Result = void,
	Errors = never,
	RuntimeDeps = never,
	RuntimeErrors = never,
> {
	protected taskRuntime: IAcceptedTaskRuntime<
		RuntimeDeps,
		RuntimeErrors
	> | null = null;
	protected runnableMode: IRunnableMode = "sequential";

	constructor(
		protected readonly taskFactory: () => E.Effect<Result, Errors, never>,
	) {}

	executor(providedRuntime: typeof this.taskRuntime) {
		this.taskRuntime = providedRuntime;
		return this;
	}

	protected assertRuntimeProvided(): asserts this is {
		taskRuntime: IAcceptedTaskRuntime<RuntimeDeps, RuntimeErrors>;
	} {
		if (!this.taskRuntime) {
			throw new Error("[TaskBuilder] - task runtime was not provided.");
		}
	}

	concurrent() {
		this.runnableMode = "concurrent";
		return this;
	}

	sequential() {
		this.runnableMode = "sequential";
		return this;
	}

	clone() {
		const taskBuilder = new TaskBuilder(this.taskFactory);
		taskBuilder.runnableMode = this.runnableMode;
		return taskBuilder;
	}

	build() {
		this.assertRuntimeProvided();
		return new Runnable(
			this.taskRuntime,
			this.taskFactory(),
			this.runnableMode,
		);
	}
}
