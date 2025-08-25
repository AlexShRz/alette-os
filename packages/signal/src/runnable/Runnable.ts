import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { v4 as uuid } from "uuid";
import { IRunnableState } from "./IRunnableState.js";

export type IRunnableMode = "concurrent" | "sequential";

export class Runnable<
	Value = void,
	Errors = never,
	RuntimeContext = never,
	RuntimeErrors = never,
> {
	protected id = uuid();

	protected state: SubscriptionRef.SubscriptionRef<
		IRunnableState<Value, Errors>
	>;
	protected runForkJoin: <A, E>(
		effect: E.Effect<A, E>,
	) => E.Effect<A, E | RuntimeErrors>;
	protected executingFiber: SubscriptionRef.SubscriptionRef<Fiber.RuntimeFiber<
		void,
		RuntimeErrors
	> | null>;

	constructor(
		protected runtime: ManagedRuntime.ManagedRuntime<
			RuntimeContext,
			RuntimeErrors
		>,
		protected runner: E.Effect<Value, Errors, never>,
		protected prefersMode: IRunnableMode = "sequential",
	) {
		this.state = E.runSync(
			SubscriptionRef.make<IRunnableState<Value, Errors>>({
				status: "uninitialized",
			}),
		);
		this.executingFiber = this.runtime.runSync(
			SubscriptionRef.make<Fiber.RuntimeFiber<void, RuntimeErrors> | null>(
				null,
			),
		);
		this.runForkJoin = (effect) => Fiber.join(this.runtime.runFork(effect));
	}

	isConcurrent() {
		return this.prefersMode === "concurrent";
	}

	isSequential() {
		return this.prefersMode === "sequential";
	}

	isCompleted() {
		const { status } = this.getStateSync();

		return (
			status === "succeeded" || status === "failed" || status === "interrupted"
		);
	}

	isSucceeded() {
		const { status } = this.getStateSync();
		return status === "succeeded";
	}

	isInterrupted() {
		const { status } = this.getStateSync();
		return status === "interrupted";
	}

	isFailed() {
		const { status } = this.getStateSync();
		return status === "failed";
	}

	getId() {
		return this.id;
	}

	getFiberOrThrow() {
		return this.executingFiber.get.pipe(
			E.andThen((fiber) =>
				E.gen(function* () {
					if (!fiber) {
						return yield* E.dieMessage(
							"[Runnable] - Cannot obtain fiber. Either it was not set or the runnable is not running.",
						);
					}

					return fiber;
				}),
			),
		);
	}

	protected getStateSync() {
		return E.runSync(SubscriptionRef.get(this.state));
	}

	protected getState() {
		const getSubscriptionState = this.state.changes
			.pipe(
				Stream.filter((state) => state.status !== "uninitialized"),
				Stream.take(1),
				Stream.runCollect,
			)
			.pipe(E.andThen((chunk) => Chunk.unsafeGet(chunk, 0)));

		return this.runForkJoin(getSubscriptionState);
	}

	interrupt() {
		this.runtime.runFork(
			this.executingFiber.changes.pipe(
				Stream.filter((fiber) => !!fiber),
				Stream.take(1),
				Stream.tap((fiber) => Fiber.interrupt(fiber)),
				Stream.runDrain,
			),
		);
	}

	waitForTrigger() {
		return this.runtime.runFork(
			this.executingFiber.changes.pipe(
				Stream.filter((fiber) => !!fiber),
				Stream.take(1),
				Stream.runDrain,
			),
		);
	}

	waitForCompletion() {
		return this.resultSafe().pipe(E.andThen(() => E.void));
	}

	resultAsync() {
		return this.runtime.runPromise(this.result());
	}

	result() {
		const operation = E.gen(this, function* () {
			const state = yield* this.getState();
			const { status } = state;

			if (status === "failed" || status === "interrupted") {
				return yield* E.fail(state.error);
			}

			return yield* E.succeed(state.value);
		});

		return this.runForkJoin(operation);
	}

	resultSafe() {
		const operation = E.gen(this, function* () {
			const state = yield* this.getState();
			const { status } = state;

			if (status === "failed") {
				return Exit.fail(state.error);
			}

			if (status === "interrupted") {
				const fiber = yield* this.executingFiber.get;
				return Exit.interrupt(Fiber.id(fiber!));
			}

			return Exit.succeed(state.value);
		});

		return this.runForkJoin(operation);
	}

	spawn() {
		const runnable = SubscriptionRef.getAndUpdateEffect(this.state, (state) =>
			E.gen(this, function* () {
				if (state.status !== "uninitialized") {
					return state;
				}

				return yield* this.runTaskAndUpdateState();
			}),
		);

		this.runtime.runFork(runnable);
	}

	protected runTaskAndUpdateState() {
		return E.async<IRunnableState<Value, Errors>>((resume) => {
			const task = this.runner.pipe(
				E.andThen((value) => {
					resume(
						E.succeed({
							status: "succeeded",
							value,
						}),
					);
				}),
				E.catchAll((error) => {
					resume(
						E.succeed({
							status: "failed",
							error,
						}),
					);

					return E.void;
				}),
				E.onInterrupt(() => {
					resume(
						E.succeed({
							status: "interrupted",
							error: new Cause.InterruptedException(
								"Runnable was interrupted.",
							),
						}),
					);

					return E.void;
				}),
			);

			const fiber = this.runtime.runFork(task);
			this.runtime.runFork(SubscriptionRef.set(this.executingFiber, fiber));
			return Fiber.interruptFork(fiber);
		});
	}
}
