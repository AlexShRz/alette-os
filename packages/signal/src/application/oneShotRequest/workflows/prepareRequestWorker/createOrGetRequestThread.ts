import * as E from "effect/Effect";
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
	return yield* threadRegistry.getOrCreate(threadId);
});
