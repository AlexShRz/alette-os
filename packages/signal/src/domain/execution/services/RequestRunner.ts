import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
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
				/**
				 * TODO: Wrap in sync ref?
				 * FiberHandle does not work for some reason
				 * */
				let runningRequest: Fiber.RuntimeFiber<unknown, unknown> | null = null;
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
						return E.gen(function* () {
							yield* metrics.recordAttemptedExecution();
							isRunning = true;
							yield* task.pipe(
								E.ensuring(
									E.sync(() => {
										runningRequest = null;
										isRunning = false;
									}),
								),
							);
						});
					},
					interrupt() {
						return E.gen(function* () {
							if (runningRequest) {
								yield* Fiber.interruptFork(runningRequest);
							}
							runningRequest = null;
							isRunning = false;
						}).pipe(E.forkIn(scope));
					},
				};
			}),
		).pipe(Layer.provide(RequestMetrics.Default));
	}
}
