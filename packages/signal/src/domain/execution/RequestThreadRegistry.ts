import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LayerMap from "effect/LayerMap";
import * as RcMap from "effect/RcMap";
import * as Stream from "effect/Stream";
import { v4 as uuid } from "uuid";
import { GlobalContext } from "../context/services/GlobalContext";
import { RequestErrorProcessor } from "../errors/RequestErrorProcessor";
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
		dependencies: [RequestErrorProcessor.Default],
		scoped: E.gen(function* () {
			const id = uuid();
			const errorProcessor = yield* RequestErrorProcessor;
			const globalContext = yield* GlobalContext;

			/**
			 * 1. Multiple requests will try to access thread data
			 * concurrently (can be up to 10k requests or more if state is shared
			 * between them)
			 * */
			const threads = yield* LayerMap.make(
				(threadId: string) =>
					RequestThread.Default(threadId).pipe(
						Layer.provide(Layer.succeed(GlobalContext, globalContext)),
					),
				{
					idleTimeToLive: REQUEST_THREAD_TTL,
				},
			);

			const self = {
				has(threadId: string) {
					return RcMap.has(threads.rcMap, threadId);
				},

				getId() {
					return id;
				},

				getAll() {
					return E.gen(this, function* () {
						const activeThreadIds = yield* this.getIds();
						const activeThreads: RequestThread[] = [];

						for (const threadId of activeThreadIds) {
							const threadRuntime =
								yield* this.getOrCreateThreadRuntime(threadId);
							const thread = yield* E.serviceOptional(RequestThread).pipe(
								E.provide(threadRuntime),
							);
							activeThreads.push(thread);
						}

						return activeThreads;
					});
				},

				getIds() {
					return RcMap.keys(threads.rcMap);
				},

				getOrCreateThreadRuntime(threadId: string) {
					return threads.runtime(threadId);
				},

				remove(threadId: string) {
					return threads.invalidate(threadId);
				},
			};

			/**
			 * Dispose of all threads on fatal error
			 * */
			yield* errorProcessor.takeFatal().pipe(
				Stream.tap(() =>
					E.gen(function* () {
						for (const threadId of yield* self.getIds()) {
							yield* self.remove(threadId);
						}
					}),
				),
				Stream.runDrain,
				E.forkScoped,
			);

			return self;
		}),
	},
) {}
