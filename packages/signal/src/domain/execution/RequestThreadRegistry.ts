import * as E from "effect/Effect";
import * as RcMap from "effect/RcMap";
import { RequestThread } from "./RequestThread";

/**
 * 1. Request threads are tied to request middleware config.
 * 2. Threads do not know about plugins and plugins do not
 * know about threads - they are independent.
 * 3. Each thread is like a "router" that accepts requests of
 * a specific configuration and routes it to a low-level request worker.
 * 4. When we detect that a thread is idle (ref count reaches 0), we need
 * to remove it to clear memory.
 * */
export const REQUEST_THREAD_TTL = "15 seconds";

export class RequestThreadRegistry extends E.Service<RequestThreadRegistry>()(
	"RequestThreadRegistry",
	{
		scoped: E.gen(function* () {
			/**
			 * 1. Multiple requests will try to access thread data
			 * concurrently (can be up to 10k requests or more if state is shared
			 * between them)
			 * */
			const threads = yield* RcMap.make({
				lookup: (threadId: string) =>
					E.acquireRelease(
						RequestThread.makeAsValue(RequestThread.Default(threadId)),
						(thread) => thread.shutdown(),
					),
				idleTimeToLive: REQUEST_THREAD_TTL,
			});

			return {
				has(threadId: string) {
					return RcMap.has(threads, threadId);
				},

				getAll() {
					return E.gen(this, function* () {
						const activeThreadIds = yield* this.getIds();
						const activeThreads: RequestThread[] = [];

						for (const threadId of activeThreadIds) {
							const thread = yield* this.getOrCreate(threadId);
							activeThreads.push(thread);
						}

						return activeThreads;
					});
				},

				getIds() {
					return RcMap.keys(threads);
				},

				getOrCreate(threadId: string) {
					return RcMap.get(threads, threadId);
				},

				remove(threadId: string) {
					return RcMap.invalidate(threads, threadId);
				},
			};
		}),
	},
) {}
