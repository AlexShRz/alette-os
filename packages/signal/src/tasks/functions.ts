import * as E from "effect/Effect";
import { CommandTaskBuilder } from "./CommandTaskBuilder.js";
import { AnyQueryTaskValue, QueryTaskBuilder } from "./QueryTaskBuilder.js";

export const task = <Errors>(future: () => E.Effect<void, Errors, never>) =>
	new CommandTaskBuilder(future);

export const queryTask = <Result extends AnyQueryTaskValue, Errors>(
	future: () => E.Effect<Result, Errors, never>,
) => new QueryTaskBuilder(future);
