import { FatalApiException } from "@alette/pulse";
import * as E from "effect/Effect";
import { RequestExceptionProcessor } from "../services/RequestExceptionProcessor";

export const panic = (fatal: FatalApiException) =>
	E.gen(function* () {
		const exceptions = yield* E.serviceOptional(RequestExceptionProcessor);
		yield* exceptions.failWithFatal(fatal);
		yield* E.die(fatal);
	}).pipe(E.orDie);
