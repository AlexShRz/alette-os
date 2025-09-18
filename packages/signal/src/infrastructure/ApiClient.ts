import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { CommandTaskBuilder } from "../application/plugins/tasks/primitive/CommandTaskBuilder";
import { QueryTaskBuilder } from "../application/plugins/tasks/primitive/QueryTaskBuilder";
import { GlobalContext } from "../domain/context/services/GlobalContext";
import { ErrorHandler } from "../domain/errors/ErrorHandler";
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

	protected createRuntime() {
		const runtime = ManagedRuntime.make(
			Layer.mergeAll(
				Logger.pretty,
				Kernel.Default.pipe(
					Layer.provide(
						Layer.provideMerge(
							ErrorHandler.Default((() => runtime) as () => any),
							GlobalContext.Default,
						),
					),
					Layer.provide(Layer.scope),
				),
			),
		);

		return runtime;
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
