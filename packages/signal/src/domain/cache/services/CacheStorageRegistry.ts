import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LayerMap from "effect/LayerMap";
import * as RcMap from "effect/RcMap";
import { v4 as uuid } from "uuid";
import { GlobalContext } from "../context/services/GlobalContext";
import { RequestThread } from "./RequestThread";

export class CacheStorageRegistry extends E.Service<CacheStorageRegistry>()(
	"CacheStorageRegistry",
	{
		scoped: E.gen(function* () {
			const id = uuid();
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

			return self;
		}),
	},
) {}
