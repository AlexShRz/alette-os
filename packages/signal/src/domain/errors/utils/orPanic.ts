import { FatalApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import { ErrorHandler } from "../ErrorHandler";

export const orPanic = <A, E, R>(task: E.Effect<A, E, R>) =>
	E.catchAllDefect((defect) =>
		E.gen(function* () {
			if (defect instanceof FatalApiError) {
				const errors = yield* E.serviceOptional(ErrorHandler);
				yield* errors.report(defect);
			}

			return yield* E.die(defect);
		}).pipe(E.orDie),
	)(task as E.Effect<A, never, R>);
