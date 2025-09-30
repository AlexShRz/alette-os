import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import { PluginTaskScheduler } from "../../PluginTaskScheduler";

export abstract class TaskBuilder<Result = void, Errors = never> {
	constructor(protected readonly task: E.Effect<Result, Errors, never>) {}

	sendTo(scheduler: PluginTaskScheduler) {
		scheduler.schedule(this.build());
	}

	toPromise(scheduler: PluginTaskScheduler) {
		return new Promise<Result>((resolve, reject) => {
			const configuredTask = this.build().pipe(
				E.andThen((result) =>
					/**
					 * TODO: Remove joining, introduce a proper
					 * task scheduling system.
					 * */
					E.gen(function* () {
						if (Fiber.isFiber(result) && Fiber.isRuntimeFiber(result)) {
							const unwrappedResult = yield* Fiber.join(result);
							resolve(unwrappedResult as Result);
							return;
						}

						resolve(result);
					}).pipe(E.fork),
				),
				E.catchAll((error) => E.sync(() => reject(error))),
			);

			scheduler.schedule(configuredTask);
		});
	}

	abstract clone(): this;

	build() {
		return this.task;
	}
}
