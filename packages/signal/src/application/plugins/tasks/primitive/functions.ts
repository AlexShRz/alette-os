import * as E from "effect/Effect";
import { CommandTaskBuilder } from "./CommandTaskBuilder";
import { QueryTaskBuilder } from "./QueryTaskBuilder";

export const task = <Errors>(task: E.Effect<void, Errors, never>) =>
	new CommandTaskBuilder(task);

export const queryTask = <Result, Errors>(
	task: E.Effect<Result, Errors, never>,
) => new QueryTaskBuilder(task);
