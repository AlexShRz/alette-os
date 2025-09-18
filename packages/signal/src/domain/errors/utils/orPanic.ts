import * as E from "effect/Effect";
import { panic } from "./panic";

export const orPanic = <A, E, R>(task: E.Effect<A, E, R>) =>
	E.catchAllDefect(panic)(task as E.Effect<A, never, R>);
