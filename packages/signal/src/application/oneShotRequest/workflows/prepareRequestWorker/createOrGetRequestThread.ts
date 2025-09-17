import * as E from "effect/Effect";
import { RequestThread } from "../../../../domain/execution/RequestThread";
import { ActiveApiPlugin } from "../../../plugins/services/ActiveApiPlugin";
import { PrepareRequestWorkerArguments } from "./PrepareRequestWorkerArguments";

/**
 * 1. Create the request thread that will supervise
 * request workers.
 * */
export const createOrGetRequestThread = E.fn(function* (
	plugin: ActiveApiPlugin,
) {
	const { threadId } = yield* PrepareRequestWorkerArguments;
	const threadRegistry = plugin.getThreads();
	const threadRuntime =
		yield* threadRegistry.getOrCreateThreadRuntime(threadId);
	return yield* E.serviceOptional(RequestThread).pipe(E.provide(threadRuntime));
});
