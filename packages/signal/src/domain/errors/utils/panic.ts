import { FatalApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import { RequestErrorProcessor } from "../services/RequestErrorProcessor";

export const panic = (fatal: FatalApiError) =>
	E.gen(function* () {
		const errors = yield* E.serviceOptional(RequestErrorProcessor);
		yield* errors.failWithFatal(fatal);
		yield* E.die(fatal);
	}).pipe(E.orDie);
