import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as FiberSet from "effect/FiberSet";
import * as Scope from "effect/Scope";
import { ApiPlugin } from "../../plugins/ApiPlugin";

export abstract class RequestControllerSupervisor {
	/**
	 * Scope and fibers
	 * */
	protected scope: Scope.CloseableScope;
	protected supervisedFibers: FiberSet.FiberSet;

	constructor(protected plugin: ApiPlugin) {
		const runtime = this.plugin.getRuntime();
		this.scope = runtime.runSync(Scope.make());

		// runtime.runFork(Scope.close(this.scope, Exit.void));
		// Scope.fork(scope, Exit.void);

		runtime.runSync(
			Scope.addFinalizer(
				this.scope,
				E.sync(() => {
					console.log("hjhjkkjjkbbjkbjkbjkbkj");
				}),
			),
		);

		this.supervisedFibers = runtime.runSync(
			FiberSet.make().pipe(Scope.extend(this.scope)),
		);
	}

	getScope() {
		return this.scope;
	}

	spawnAndSupervise<A, I, R>(task: E.Effect<A, I, R>) {
		const runtime = this.plugin.getRuntime();

		const scopedTask = task.pipe(Scope.extend(this.scope)) as E.Effect<
			A,
			I,
			never
		>;

		const supervisedTask = runtime.runFork(scopedTask);
		runtime.runFork(FiberSet.add(this.supervisedFibers, supervisedTask));

		return runtime.runFork(supervisedTask);
	}

	shutdown() {
		this.plugin.getRuntime().runFork(Scope.close(this.scope, Exit.void));
	}
}
