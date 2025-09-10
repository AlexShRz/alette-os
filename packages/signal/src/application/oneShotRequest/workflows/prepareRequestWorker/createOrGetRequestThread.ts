import * as E from "effect/Effect";
import { RequestThreadRegistry } from "../../../../domain/execution/RequestThreadRegistry";
import { PrepareRequestWorkerArguments } from "./PrepareRequestWorkerArguments";

/**
 * 1. Create the request thread that will supervise
 * request workers.
 * */
export const createOrGetRequestThread = E.gen(function* () {
	const { threadId } = yield* PrepareRequestWorkerArguments;
	const threadRegistry = yield* E.serviceOptional(RequestThreadRegistry);

	return yield* threadRegistry.getOrCreate(threadId);
});
