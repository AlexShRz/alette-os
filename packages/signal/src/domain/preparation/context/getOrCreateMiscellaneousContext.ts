import * as E from "effect/Effect";
import { orPanic } from "../../errors/utils/orPanic";
import { RequestSessionContext } from "../../execution/services/RequestSessionContext";
import { MiscellaneousContext } from "./MiscellaneousContext";

export const getOrCreateMiscellaneousContext = E.gen(function* () {
	const requestContext = yield* E.serviceOptional(RequestSessionContext);
	return yield* requestContext.getOrCreate(
		"miscellaneous",
		E.succeed(new MiscellaneousContext()),
	);
}).pipe(orPanic);
