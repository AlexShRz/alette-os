import * as Deferred from "effect/Deferred";
import * as E from "effect/Effect";
import { Task } from "./Task.js";
import { TaskBuilder } from "./TaskBuilder.js";

export interface ICommandTaskSuccessHook {
	(): void;
}

export class CommandTaskBuilder<Errors = never> extends TaskBuilder<
	void,
	Errors
> {
	protected successHooks: ICommandTaskSuccessHook[] = [];

	constructor(factory: () => E.Effect<void, Errors, never>) {
		super(factory);
	}

	whenSucceeded(hook: (typeof this.successHooks)[number]) {
		this.successHooks = [...this.successHooks, hook];
		return this;
	}

	clone() {
		const self = this.cloneWithCommonSettings(
			(...args) => new CommandTaskBuilder<Errors>(...args),
		);
		self.successHooks = [...this.successHooks];
		return self as this;
	}

	build() {
		this.assertRuntimeProvided();

		return E.gen(this, function* () {
			const deferred = yield* Deferred.make<void, Errors>();

			return new Task(
				{
					task: this.taskFactory(),
					runtime: this.taskRuntime,
					deferred,
				},
				{
					onSuccess: [...this.successHooks],
					onFailure: [...this.failureHooks],
					onCancel: [...this.cancellationHooks],
				},
			);
		});
	}
}
