import { FatalApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import { ErrorHandler, THandleableError } from "../ErrorHandler";
import { UnknownErrorCaught } from "../errors";

export const panic = (error: THandleableError) =>
	E.gen(function* () {
		const errors = yield* E.serviceOptional(ErrorHandler);

		if (error instanceof FatalApiError) {
			yield* errors.handle(error);
		}

		if (!(error instanceof FatalApiError)) {
			yield* errors.handle(new UnknownErrorCaught(error));
		}

		return yield* E.die(error);
	}).pipe(E.orDie);
