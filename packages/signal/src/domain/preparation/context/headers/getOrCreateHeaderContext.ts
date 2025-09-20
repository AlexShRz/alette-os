import * as E from "effect/Effect";
import { orPanic } from "../../../errors/utils/orPanic";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { HeaderContext } from "./HeaderContext";

export const getOrCreateHeaderContext = E.gen(function* () {
	const requestContext = yield* E.serviceOptional(RequestSessionContext);
	return yield* requestContext.getOrCreate(
		"headers",
		E.succeed(new HeaderContext()),
	);
}).pipe(orPanic);
