import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { CommandTaskBuilder } from "../application/plugins/tasks/primitive/CommandTaskBuilder";
import { QueryTaskBuilder } from "../application/plugins/tasks/primitive/QueryTaskBuilder";
import { GlobalContext } from "../domain/context/services/GlobalContext";
import { ErrorHandler } from "../domain/errors/ErrorHandler";
import { SystemLogger } from "../domain/logger/SystemLogger";
import { Kernel } from "./Kernel";

export interface IApiRuntimeGetter {
	(): ManagedRuntime.ManagedRuntime<any, any>;
}

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

	/**
	 * This method can be overridden for testing
	 * */
	protected getServices(getRuntime: IApiRuntimeGetter) {
		const logger = Logger.make(() => {
			const text = "-- Alette Signal Log --";
			/**
			 * 1. White text on black background.
			 * 2. The color shows in Node.js (jest/vitest) too, not only browsers.
			 * */
			console.log(`\x1b[97m\x1b[40m${text}\x1b[0m`);
		});

		return Layer.mergeAll(
			Layer.provideMerge(
				Layer.provideMerge(
					Kernel.Default.pipe(
						Layer.provide(
							Layer.provideMerge(
								ErrorHandler.Default(getRuntime),
								GlobalContext.Default,
							),
						),
						Layer.provide(Layer.scope),
					),
					SystemLogger.Default,
				),
				Logger.replace(
					Logger.defaultLogger,
					Logger.zip(logger, Logger.prettyLoggerDefault),
				),
			),
		);
	}

	protected createRuntime() {
		const runtime = ManagedRuntime.make(
			this.getServices((() => runtime) as () => any),
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
