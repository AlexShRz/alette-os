import * as E from "effect/Effect";
import { PluginTaskScheduler } from "../../PluginTaskScheduler";

export abstract class TaskBuilder<Result = void, Errors = never> {
	constructor(protected readonly task: E.Effect<Result, Errors, never>) {}

	sendTo(scheduler: PluginTaskScheduler) {
		scheduler.schedule(this.build());
	}

	toPromise(scheduler: PluginTaskScheduler) {
		return new Promise<Result>((resolve, reject) => {
			const configuredTask = this.build().pipe(
				E.andThen((result) => resolve(result)),
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
