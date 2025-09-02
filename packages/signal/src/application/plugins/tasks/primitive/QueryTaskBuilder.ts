import * as Cause from "effect/Cause";
import * as E from "effect/Effect";
import { TaskBuilder } from "./TaskBuilder";

export class QueryTaskBuilder<Result = any, Errors = never> extends TaskBuilder<
	Result,
	Errors
> {
	protected successHooks: ((result: Result) => void)[] = [];
	protected failureHooks: ((error: Errors) => void)[] = [];
	protected interruptionsHooks: ((
		error: Cause.InterruptedException,
	) => void)[] = [];

	constructor(factory: () => E.Effect<Result, Errors, never>) {
		super(factory);
	}

	whenSucceeded(hook: (typeof this.successHooks)[number]) {
		this.successHooks.push(hook);
		return this;
	}

	whenFailed(hook: (typeof this.failureHooks)[number]) {
		this.failureHooks.push(hook);
		return this;
	}

	whenInterrupted(hook: (typeof this.interruptionsHooks)[number]) {
		this.interruptionsHooks.push(hook);
		return this;
	}

	override clone() {
		return new QueryTaskBuilder(this.taskFactory) as this;
	}

	override build() {
		const runnable = super.build();

		runnable
			.resultAsync()
			.then((result) => {
				this.successHooks.forEach((hook) => {
					hook(result);
				});
			})
			.catch((error: Errors) => {
				if (error instanceof Cause.InterruptedException) {
					this.interruptionsHooks.forEach((hook) => {
						hook(error);
					});
					return;
				}

				this.failureHooks.forEach((hook) => {
					hook(error);
				});
			});

		return runnable;
	}
}
