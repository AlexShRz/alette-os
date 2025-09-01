import * as E from "effect/Effect";
import { CommandTaskBuilder } from "./CommandTaskBuilder";
import { QueryTaskBuilder } from "./QueryTaskBuilder";

export const task = <Errors>(
	taskDefinition: () => E.Effect<void, Errors, never>,
) => new CommandTaskBuilder(taskDefinition);

export const queryTask = <Result, Errors>(
	taskDefinition: () => E.Effect<Result, Errors, never>,
) => new QueryTaskBuilder(taskDefinition);

export const getQueryResult = <Result, Errors>(
	query: QueryTaskBuilder<Result, Errors>,
) =>
	E.async<Result, Errors>((resume) => {
		query
			.whenSucceeded((result) => resume(E.succeed(result)))
			.whenFailed((error) => resume(E.fail(error)))
			.whenInterrupted((error) => resume(E.fail(error as Errors)));
	});
