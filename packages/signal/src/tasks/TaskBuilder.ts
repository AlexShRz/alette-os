import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import { Task } from "./Task.js";

export interface ITaskFailureHook<Errors> {
	(error: Errors): void;
}

export interface ITaskCancellationHook {
	(): void;
}

export abstract class TaskBuilder<Result = void, Errors = never> {
	protected failureHooks: ITaskFailureHook<Errors>[] = [];
	protected cancellationHooks: ITaskCancellationHook[] = [];
	protected taskRuntime: Runtime.Runtime<never> | null = null;

	protected constructor(
		protected readonly taskFactory: () => E.Effect<Result, Errors, never>,
	) {}

	whenCancelled(hook: (typeof this.cancellationHooks)[number]) {
		this.cancellationHooks = [...this.cancellationHooks, hook];
		return this;
	}

	whenFailed(hook: (typeof this.failureHooks)[number]) {
		this.failureHooks = [...this.failureHooks, hook];
		return this;
	}

	runIn(providedRuntime: Runtime.Runtime<never>) {
		this.taskRuntime = providedRuntime;
		return this;
	}

	protected assertRuntimeProvided(): asserts this is {
		taskRuntime: Runtime.Runtime<never>;
	} {
		if (!this.taskRuntime) {
			throw new Error("[TaskBuilder] - task runtime was not provided.");
		}
	}

	abstract clone(): this;

	protected cloneWithCommonSettings<T extends TaskBuilder<Result, Errors>>(
		cloner: (factory: () => E.Effect<Result, Errors, never>) => T,
	): T {
		const self = cloner(this.taskFactory);
		self.failureHooks = [...this.failureHooks] as any;
		self.cancellationHooks = [...this.cancellationHooks];
		self.taskRuntime = this.taskRuntime;
		return self;
	}

	abstract build(): E.Effect<Task<Result, Errors>>;
}
