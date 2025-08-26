import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import { IRunnableMode, Runnable } from "../../runnable/Runnable";

export interface IAcceptedTaskRuntime<A> extends Runtime.Runtime<A> {}

export class TaskBuilder<Result = void, Errors = never> {
	protected runnableMode: IRunnableMode = "sequential";

	constructor(
		protected readonly taskFactory: () => E.Effect<Result, Errors, never>,
	) {}

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
		return new Runnable(this.taskFactory(), this.runnableMode);
	}
}
