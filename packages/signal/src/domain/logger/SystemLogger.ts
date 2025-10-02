import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as Stream from "effect/Stream";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { EnvironmentMode } from "../environment/EnvironmentMode";

export interface ISystemLoggerConfig {
	logInfo: boolean;
	logFatal: boolean;
	logDebug: boolean;
	logError: boolean;
}

interface ISystemLoggerState {
	wasManuallyChanged: boolean;
	config: ISystemLoggerConfig;
}

export class SystemLogger extends E.Service<SystemLogger>()("SystemLogger", {
	accessors: true,
	scoped: E.gen(function* () {
		const environment = yield* EnvironmentMode;
		const state = yield* SynchronizedRef.make<ISystemLoggerState>({
			wasManuallyChanged: false,
			config: {
				logDebug: false,
				logInfo: false,
				logError: false,
				/**
				 * Always log fatal errors
				 * in any environment by default.
				 * */
				logFatal: true,
			},
		});
		const runtime = yield* E.runtime();
		const runFork = Runtime.runFork(runtime);

		yield* environment.track().pipe(
			Stream.tap(
				E.fn(function* () {
					const { wasManuallyChanged } = yield* state;

					if (wasManuallyChanged) {
						return;
					}

					const canDisplayLogs = !(yield* environment.isProduction());

					yield* SynchronizedRef.getAndUpdate(state, (currentState) => {
						return {
							...currentState,
							config: {
								...currentState.config,
								logDebug: canDisplayLogs,
								logInfo: canDisplayLogs,
								logError: canDisplayLogs,
							},
						};
					});
				}),
			),
			Stream.runDrain,
			E.forkScoped,
		);

		return {
			setConfig(passedConfig: ISystemLoggerConfig) {
				return SynchronizedRef.getAndUpdate(state, (currentState) => ({
					...currentState,
					wasManuallyChanged: true,
					config: passedConfig,
				}));
			},

			log(message: string) {
				runFork(
					E.gen(function* () {
						const { config } = yield* state.get;

						if (config.logInfo) {
							yield* E.log(message);
						}
					}),
				);
			},

			logDebug(message: string) {
				runFork(
					E.gen(function* () {
						const { config } = yield* state.get;

						if (config.logDebug) {
							yield* E.logDebug(message);
						}
					}),
				);
			},

			logError(message: string) {
				runFork(
					E.gen(function* () {
						const { config } = yield* state.get;

						if (config.logError) {
							yield* E.logError(message);
						}
					}),
				);
			},

			logFatal(message: string) {
				runFork(
					E.gen(function* () {
						const { config } = yield* state.get;

						if (config.logFatal) {
							yield* E.logFatal(message);
						}
					}),
				);
			},
		};
	}),
}) {}
