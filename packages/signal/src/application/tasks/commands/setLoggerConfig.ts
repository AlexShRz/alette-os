import * as E from "effect/Effect";
import { SystemLogger } from "../../../domain/logger/SystemLogger";
import { LoggerConfigBuilder } from "../../logger/LoggerConfigBuilder";
import { task } from "../../plugins/tasks/primitive/functions";

interface ILoggerConfigurator {
	(config: LoggerConfigBuilder): LoggerConfigBuilder;
}

export const setLoggerConfig = (configurator: ILoggerConfigurator) =>
	task(
		E.gen(function* () {
			const logger = yield* E.serviceOptional(SystemLogger);
			yield* logger.setConfig(configurator(new LoggerConfigBuilder()).build());
		}),
	);
