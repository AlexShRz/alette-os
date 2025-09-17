import * as E from "effect/Effect";
import { RequestThread } from "../../../../domain/execution/RequestThread";
import { RequestThreadRegistry } from "../../../../domain/execution/RequestThreadRegistry";
import { PrepareRequestWorkerArguments } from "./PrepareRequestWorkerArguments";

/**
 * 1. Create the request thread that will supervise
 * request workers.
 * */
export const createOrGetRequestThread = E.gen(function* () {
	const { threadId } = yield* PrepareRequestWorkerArguments;
	const threadRegistry = yield* RequestThreadRegistry;
	const threadRuntime =
		yield* threadRegistry.getOrCreateThreadRuntime(threadId);
	return yield* E.serviceOptional(RequestThread).pipe(E.provide(threadRuntime));
});
