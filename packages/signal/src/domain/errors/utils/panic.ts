import { FatalApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import { ErrorHandler } from "../ErrorHandler";

export const panic = (fatal: FatalApiError) =>
	E.gen(function* () {
		const errors = yield* E.serviceOptional(ErrorHandler);
		yield* errors.handle(fatal);
		yield* E.die(fatal);
	}).pipe(E.orDie);
