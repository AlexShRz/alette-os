import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { Kernel } from "./Kernel.js";
import { TaskScheduler } from "./tasks/TaskScheduler";
import { CommandTaskBuilder } from "./tasks/primitive/CommandTaskBuilder";
import { QueryTaskBuilder } from "./tasks/primitive/QueryTaskBuilder";

export const client = (...commands: CommandTaskBuilder[]) =>
	new ApiClient(() => commands.map((command) => command.clone()));

export class ApiClient {
	protected runtime = this.createRuntime();

	constructor(protected getMemoizedConfig: () => CommandTaskBuilder[]) {}

	protected createRuntime() {
		const requirements = Layer.provideMerge(
			Kernel.Default,
			TaskScheduler.Default,
		);
		return ManagedRuntime.make(requirements);
	}

	ask<A, E>(query: QueryTaskBuilder<A, E>) {
		return this.runtime.runPromise(
			E.gen(function* () {
				const scheduler = yield* E.serviceOptional(TaskScheduler);
				const runnable = yield* scheduler.scheduleHighPriority(query.build());
				return yield* runnable.result();
			}),
		);
	}

	tell<I>(...commands: CommandTaskBuilder<I>[]) {
		this.runtime.runSync(
			E.gen(function* () {
				const scheduler = yield* E.serviceOptional(TaskScheduler);

				for (const command of commands) {
					yield* scheduler.scheduleHighPriority(command.concurrent().build());
				}
			}),
		);
	}

	reset() {
		this.runtime.dispose().catch((e) => e);
		this.runtime = this.createRuntime();
		this.tell(...this.getMemoizedConfig());
	}
}
