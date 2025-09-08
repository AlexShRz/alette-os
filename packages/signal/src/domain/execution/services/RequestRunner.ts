import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as FiberHandle from "effect/FiberHandle";
import * as Layer from "effect/Layer";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { RequestMetrics } from "../RequestMetrics";

export class RequestRunner extends Context.Tag("RequestRunner")<
	RequestRunner,
	{
		isRunning(): boolean;

		supervise(task: E.Effect<unknown, never, never>): E.Effect<void>;

		interrupt(): E.Effect<void>;
	}
>() {
	static make() {
		return Layer.scoped(
			this,
			E.gen(function* () {
				const scope = yield* E.scope;
				/**
				 * 1. Here we hold the actual request that's being executed
				 * 2. We need to wrap it inside sync ref because
				 * multiple request controllers will have to access the handle
				 * simultaneously.
				 * */
				let isRunning = false;
				const runningRequest = yield* SynchronizedRef.make(
					yield* FiberHandle.make(),
				);
				const metrics = yield* RequestMetrics;

				yield* E.addFinalizer(() =>
					E.sync(() => {
						isRunning = false;
					}),
				);

				return {
					isRunning() {
						return isRunning;
					},
					supervise(task) {
						return SynchronizedRef.getAndUpdateEffect(
							runningRequest,
							(supervisor) =>
								E.gen(function* () {
									yield* metrics.recordAttemptedExecution();
									isRunning = true;
									yield* FiberHandle.run(
										supervisor,
										task.pipe(
											E.ensuring(
												E.sync(() => {
													isRunning = false;
												}),
											),
										),
									);
									return supervisor;
								}),
						);
					},
					interrupt() {
						return SynchronizedRef.getAndUpdateEffect(
							runningRequest,
							E.fn(function* (supervisor) {
								yield* FiberHandle.clear(supervisor);
								isRunning = false;
								return supervisor;
							}),
						).pipe(E.forkIn(scope));
					},
				};
			}),
		).pipe(Layer.provide(RequestMetrics.Default));
	}
}
