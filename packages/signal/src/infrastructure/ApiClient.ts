import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { CommandTaskBuilder } from "../application/plugins/tasks/primitive/CommandTaskBuilder";
import { QueryTaskBuilder } from "../application/plugins/tasks/primitive/QueryTaskBuilder";
import { GlobalContext } from "../domain/context/services/GlobalContext";
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
		return Layer.mergeAll(
			Logger.pretty,
			Layer.provideMerge(
				Kernel.Default.pipe(Layer.provide(GlobalContext.Default)),
				Layer.scope,
			),
		);
	}

	protected createRuntime() {
		return ManagedRuntime.make(this.getRuntimeServices());
	}

	ask<A, E>(query: QueryTaskBuilder<A, E>): Promise<A> {
		return this.runtime.runPromise(
			E.gen(function* () {
				const kernel = yield* Kernel;
				return yield* kernel.runQuery(query.build());
			}),
		);
	}

	tell<I>(...commands: CommandTaskBuilder<I>[]): void {
		this.runtime.runSync(
			E.gen(this, function* () {
				const kernel = yield* Kernel;

				for (const command of commands) {
					yield* kernel.runCommand(command.build());
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
