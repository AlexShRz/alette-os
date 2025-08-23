import * as Deferred from "effect/Deferred";
import * as E from "effect/Effect";
import { Task } from "./Task.js";
import { TaskBuilder } from "./TaskBuilder.js";

export interface IQueryTaskSuccessHook<Result> {
	(result: Result): void;
}

export type AnyQueryTaskValue = string | boolean | object | Function | symbol;

export class QueryTaskBuilder<
	Result extends AnyQueryTaskValue = AnyQueryTaskValue,
	Errors = never,
> extends TaskBuilder<Result, Errors> {
	protected successHooks: IQueryTaskSuccessHook<Result>[] = [];

	constructor(factory: () => E.Effect<Result, Errors, never>) {
		super(factory);
	}

	whenSucceeded(hook: (typeof this.successHooks)[number]) {
		this.successHooks = [...this.successHooks, hook];
		return this;
	}

	clone() {
		const self = this.cloneWithCommonSettings(
			(...args) => new QueryTaskBuilder<Result, Errors>(...args),
		);
		self.successHooks = [...this.successHooks];
		return self as this;
	}

	build() {
		this.assertRuntimeProvided();

		return E.gen(this, function* () {
			const deferred = yield* Deferred.make<Result, Errors>();

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
