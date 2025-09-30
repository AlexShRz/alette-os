import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import { isTestEnv } from "../../shared/utils/isTestEnv";

export interface ISystemLoggerConfig {
	logInfo: boolean;
	logFatal: boolean;
	logDebug: boolean;
	logError: boolean;
}

export class SystemLogger extends E.Service<SystemLogger>()("SystemLogger", {
	scoped: E.gen(function* () {
		let config: ISystemLoggerConfig = {
			logDebug: false,
			logInfo: false,
			logError: false,
			logFatal: !isTestEnv(),
		};
		const runtime = yield* E.runtime();
		const runFork = Runtime.runFork(runtime);

		return {
			setConfig(passedConfig: ISystemLoggerConfig) {
				config = passedConfig;
			},

			log(message: string) {
				if (config.logInfo) {
					runFork(E.log(message));
				}
			},

			debug(message: string) {
				if (config.logDebug) {
					runFork(E.logDebug(message));
				}
			},

			error(message: string) {
				if (config.logError) {
					runFork(E.logError(message));
				}
			},

			fatal(message: string) {
				if (config.logFatal) {
					runFork(E.logFatal(message));
				}
			},
		};
	}),
}) {}
