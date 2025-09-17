import { FatalApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import { RequestErrorProcessor } from "../RequestErrorProcessor";

export const orPanic = <A, E, R>(task: E.Effect<A, E, R>) =>
	E.catchAllDefect((defect) =>
		E.gen(function* () {
			if (defect instanceof FatalApiError) {
				const errors = yield* E.serviceOptional(RequestErrorProcessor);
				yield* errors.failWithFatal(defect);
			}

			return yield* E.die(defect);
		}).pipe(E.orDie),
	)(task as E.Effect<A, never, R>);
