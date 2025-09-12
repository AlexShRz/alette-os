// import { ExecutionStrategy } from "effect";
import * as E from "effect/Effect";
import * as RcMap from "effect/RcMap";
import * as Scope from "effect/Scope";
import { v4 as uuid } from "uuid";
import { RequestThread } from "./RequestThread";

/**
 * 1. Request threads are tied to request middleware config.
 * 2. Each thread is like a "router" that accepts requests of
 * a specific configuration and routes it to a low-level request worker.
 * 3. When we detect that a thread is idle (ref count reaches 0), we need
 * to remove it to clear memory.
 * */
export const REQUEST_THREAD_TTL = "5 seconds";

export class RequestThreadRegistry extends E.Service<RequestThreadRegistry>()(
	"RequestThreadRegistry",
	{
		effect: E.gen(function* () {
			const id = uuid();
			/**
			 * 1. We need to create scope manually here,
			 * and provide it to RcMap
			 * 2. Otherwise, the whole program will freeze when
			 * we try to do something with rc map. I have no idea why.
			 * */
			const scope = yield* Scope.make();
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
			}).pipe(Scope.extend(scope));

			return {
				has(threadId: string) {
					return RcMap.has(threads, threadId);
				},

				getId() {
					return id;
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
