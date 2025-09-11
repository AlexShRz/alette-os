import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as FiberHandle from "effect/FiberHandle";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
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
				const requestScope = yield* E.scope;
				/**
				 * 1. Here we hold the actual request that's being executed
				 * 2. We need to wrap it inside sync ref because
				 * multiple request controllers will have to access the handle
				 * simultaneously.
				 * */
				let isRunning = false;
				const requestHandle = yield* FiberHandle.make().pipe(
					Scope.extend(requestScope),
				);
				const metrics = yield* RequestMetrics;

				yield* E.addFinalizer(() =>
					E.gen(function* () {
						isRunning = false;
					}),
				);

				return {
					isRunning() {
						return isRunning;
					},
					supervise(task) {
						return E.gen(function* () {
							isRunning = true;
							yield* metrics.recordAttemptedExecution();
							yield* FiberHandle.run(
								requestHandle,
								task.pipe(
									E.ensuring(
										E.sync(() => {
											isRunning = false;
										}),
									),
								),
							);
						});
					},
					interrupt() {
						return E.gen(function* () {
							yield* FiberHandle.clear(requestHandle);
							isRunning = false;
						});
					},
				};
			}),
		).pipe(Layer.provide(RequestMetrics.Default));
	}
}
