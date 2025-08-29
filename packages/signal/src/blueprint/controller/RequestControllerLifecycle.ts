import { BusEvent } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as FiberSet from "effect/FiberSet";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Queue from "effect/Queue";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";

export abstract class RequestControllerLifecycle<State, R, ER> {
	/**
	 * State related
	 * */
	protected state: SubscriptionRef.SubscriptionRef<State | null>;
	protected eventReceiver: Queue.Queue<BusEvent>;
	/**
	 * Scope and fibers
	 * */
	protected scope: Scope.CloseableScope;
	protected supervisedFibers: FiberSet.FiberSet;

	constructor(protected runtime: ManagedRuntime.ManagedRuntime<R, ER>) {
		this.scope = this.runtime.runSync(Scope.make());
		this.state = this.runtime.runSync(SubscriptionRef.make<State | null>(null));
		this.eventReceiver = this.runtime.runSync(Queue.unbounded<BusEvent>());
		this.supervisedFibers = this.runtime.runSync(
			FiberSet.make().pipe(Scope.extend(this.scope)),
		);
	}

	abstract getInitialStateSnapshot(): State;

	getScope() {
		return this.scope;
	}

	getEventReceiver() {
		return this.eventReceiver;
	}

	takeStateChanges() {
		return this.state.changes.pipe(Stream.filter((value) => value !== null));
	}

	spawnAndSupervise<A, I, R>(task: E.Effect<A, I, R>) {
		const scopedTask = task.pipe(Scope.extend(this.scope)) as E.Effect<
			A,
			I,
			never
		>;

		return this.runtime.runSync(
			FiberSet.run(this.supervisedFibers, scopedTask),
		);
	}

	shutdown() {
		this.runtime.runSync(Scope.close(this.scope, Exit.void));
	}
}
