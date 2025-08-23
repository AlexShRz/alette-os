import * as Deferred from "effect/Deferred";
import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Runtime from "effect/Runtime";
import { ICommandTaskSuccessHook } from "./CommandTaskBuilder.js";
import { IQueryTaskSuccessHook } from "./QueryTaskBuilder.js";
import { ITaskCancellationHook, ITaskFailureHook } from "./TaskBuilder.js";

export class Task<Result = void, Errors = never> {
	protected wasCancelled = false;
	protected runFork: <A, E>(effect: E.Effect<A, E>) => Fiber.RuntimeFiber<A, E>;
	protected runSync: <A, E>(effect: E.Effect<A, E>) => A;

	constructor(
		protected config: {
			task: E.Effect<Result, Errors, never>;
			deferred: Deferred.Deferred<Result, Errors>;
			runtime: Runtime.Runtime<never>;
		},
		protected hooks: {
			onSuccess: (ICommandTaskSuccessHook | IQueryTaskSuccessHook<Result>)[];
			onCancel: ITaskCancellationHook[];
			onFailure: ITaskFailureHook<Errors>[];
		},
	) {
		this.runFork = Runtime.runFork(this.config.runtime);
		this.runSync = Runtime.runSync(this.config.runtime);

		this.config.task = this.config.task.pipe(
			E.tapBoth({
				onSuccess: this.runOnSuccessHooks(hooks),
				onFailure: this.runOnFailureHooks(hooks),
			}),
		);
	}

	isCompleted() {
		return this.runSync(Deferred.isDone(this.config.deferred));
	}

	succeed(...args: Result extends void | never ? [] : [Result]) {
		this.runFork(Deferred.succeed(this.config.deferred, ...(args as [Result])));
	}

	cancel() {
		this.runFork(
			Deferred.interrupt(this.config.deferred).pipe(E.andThen((r) => {})),
		);
	}

	fail(...args: Errors extends void | never ? [] : [Errors]) {
		const errorArgs = !!args.length
			? args
			: [new Error("[Task] - api task failed with unknown reason.")];

		this.runFork(
			Deferred.fail(this.config.deferred, ...(errorArgs as [Errors])),
		);
	}

	protected awaitTask() {
		return Deferred.await(this.config.deferred).pipe(E.tap((e) => {}));
	}

	result() {
		return Runtime.runPromise(
			this.config.runtime,
			Deferred.await(this.config.deferred),
		);
	}

	resultSafe() {
		return Runtime.runPromiseExit(
			this.config.runtime,
			Deferred.await(this.config.deferred),
		);
	}

	/**
	 * Use completeWith here, because with "Deferred.complete"
	 * the task will be spawned multiple times if we call complete()
	 * in sequence.
	 * */
	complete() {
		this.runFork(Deferred.complete(this.config.deferred, this.config.task));
	}

	protected runOnSuccessHooks(hooks: typeof this.hooks) {
		return (value: Result) =>
			E.gen(function* () {
				for (const hook of hooks.onSuccess) {
					hook(value);
				}
			});
	}

	protected runOnFailureHooks(hooks: typeof this.hooks) {
		return (error: Errors) =>
			E.gen(function* () {
				for (const hook of hooks.onFailure) {
					hook(error);
				}
			});
	}

	protected runOnCancelHooks(hooks: typeof this.hooks) {
		this.wasCancelled = true;
		return E.gen(this, function* () {
			for (const hook of hooks.onCancel) {
				hook();
			}
		});
	}
}
