import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { Kernel } from "./Kernel.js";
import { KernelTaskRunnerAvailability } from "./KernelTaskRunnerAvailability";
import { CommandTaskBuilder } from "./tasks/CommandTaskBuilder.js";
import { QueryTaskBuilder } from "./tasks/QueryTaskBuilder.js";

export const client = (...commands: CommandTaskBuilder[]) =>
	new ApiClient(() => commands.map((command) => command.clone()));

export class ApiClient {
	protected runtime = this.createRuntime();

	constructor(protected getMemoizedConfig: () => CommandTaskBuilder[]) {}

	protected createRuntime() {
		return ManagedRuntime.make(
			Layer.mergeAll(Kernel.Default, KernelTaskRunnerAvailability.Default),
		);
	}

	ask<A, I>(query: QueryTaskBuilder<A, I>) {
		return this.runtime.runPromise(
			E.gen(function* () {
				const kernel = yield* Kernel;
				const runnable = yield* kernel.run(query);
				return yield* runnable.result();
			}),
		);
	}

	tell<I>(...commands: CommandTaskBuilder<I>[]) {
		this.runtime.runSyncExit(
			E.gen(function* () {
				const kernel = yield* Kernel;

				for (const command of commands) {
					yield* kernel.run(command);
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
