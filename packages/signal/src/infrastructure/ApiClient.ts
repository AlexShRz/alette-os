import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { TaskScheduler } from "../application/plugins/tasks/TaskScheduler";
import { CommandTaskBuilder } from "../application/plugins/tasks/primitive/CommandTaskBuilder";
import { QueryTaskBuilder } from "../application/plugins/tasks/primitive/QueryTaskBuilder";
import { Kernel } from "./Kernel";

export const client = (...commands: CommandTaskBuilder[]) =>
	new ApiClient(...commands);

export class ApiClient {
	protected runtime = this.createRuntime();
	protected getMemoizedConfig: () => CommandTaskBuilder[];

	constructor(...commands: CommandTaskBuilder[]) {
		this.getMemoizedConfig = () => commands.map((command) => command.clone());
		/**
		 * Run memoized config immediately after startup
		 * */
		this.tell(...this.getMemoizedConfig());
	}

	protected getRuntimeServices() {
		return Layer.provideMerge(Kernel.Default, TaskScheduler.Default);
	}

	protected createRuntime() {
		return ManagedRuntime.make(this.getRuntimeServices());
	}

	ask<A, E>(query: QueryTaskBuilder<A, E>): Promise<A> {
		return this.runtime.runPromise(
			E.gen(function* () {
				const scheduler = yield* E.serviceOptional(TaskScheduler);
				const runnable = yield* scheduler.scheduleHighPriority(query.build());
				return yield* runnable.result();
			}),
		);
	}

	tell<I>(...commands: CommandTaskBuilder<I>[]): void {
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
