import { FatalApiException } from "@alette/pulse";
import * as E from "effect/Effect";
import { RequestExceptionProcessor } from "../services/RequestExceptionProcessor";

export const orPanic = <A, E, R>(task: E.Effect<A, E, R>) =>
	E.catchAllDefect((defect) =>
		E.gen(function* () {
			if (defect instanceof FatalApiException) {
				const exceptions = yield* E.serviceOptional(RequestExceptionProcessor);
				yield* exceptions.failWithFatal(defect);
			}

			return yield* E.die(defect);
		}).pipe(E.orDie),
	)(task as E.Effect<A, never, R>);
