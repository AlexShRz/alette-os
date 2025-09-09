import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as FiberSet from "effect/FiberSet";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Scope from "effect/Scope";

export abstract class RequestControllerSupervisor<R, ER> {
	/**
	 * Scope and fibers
	 * */
	protected scope: Scope.CloseableScope;
	protected supervisedFibers: FiberSet.FiberSet;

	constructor(protected runtime: ManagedRuntime.ManagedRuntime<R, ER>) {
		this.scope = this.runtime.runSync(Scope.make());
		this.supervisedFibers = this.runtime.runSync(
			FiberSet.make().pipe(Scope.extend(this.scope)),
		);
	}

	getScope() {
		return this.scope;
	}

	spawnAndSupervise<A, I, R>(task: E.Effect<A, I, R>) {
		const scopedTask = task.pipe(Scope.extend(this.scope)) as E.Effect<
			A,
			I,
			never
		>;

		const supervisedTask = this.runtime.runFork(scopedTask);
		this.runtime.runFork(FiberSet.add(this.supervisedFibers, supervisedTask));

		return this.runtime.runFork(supervisedTask);
	}

	shutdown() {
		this.runtime.runFork(Scope.close(this.scope, Exit.void));
	}
}
