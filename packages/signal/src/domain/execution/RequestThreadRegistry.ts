import * as Cause from "effect/Cause";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { RequestThread } from "./RequestThread";

export class RequestThreadRegistry extends E.Service<RequestThreadRegistry>()(
	"RequestThreadRegistry",
	{
		scoped: E.gen(function* () {
			const scope = yield* E.scope;
			/**
			 * 1. MUST be put inside SynchronizedRef
			 * 2. Multiple requests will try to access thread data
			 * concurrently (can be up to 10k requests or more)
			 * */
			const threads = yield* SynchronizedRef.make<Map<string, RequestThread>>(
				new Map(),
			);

			return {
				has(threadId: string) {
					return threads.get.pipe(E.andThen((values) => values.has(threadId)));
				},

				getIds() {
					return threads.get.pipe(E.andThen((values) => [...values.keys()]));
				},

				getOrThrow(threadId: string) {
					return threads.get.pipe(
						E.andThen((registry) => {
							const thread = registry.get(threadId);

							if (!thread) {
								return E.die(new Cause.IllegalArgumentException(threadId));
							}

							return E.succeed(thread);
						}),
					);
				},

				getOrCreate(threadId: string, thread: Layer.Layer<RequestThread>) {
					return SynchronizedRef.getAndUpdateEffect(threads, (values) =>
						E.gen(function* () {
							const currentThread = values.get(threadId);

							if (currentThread) {
								return values;
							}

							const newThread = yield* RequestThread.makeAsValue(thread);
							values.set(threadId, newThread);
							return values;
						}).pipe(Scope.extend(scope)),
					).pipe(E.andThen(() => this.getOrThrow(threadId)));
				},

				remove(threadId: string) {
					return SynchronizedRef.getAndUpdateEffect(threads, (values) =>
						E.gen(function* () {
							const currentThread = values.get(threadId);

							if (currentThread) {
								yield* currentThread.shutdown();
							}

							values.delete(threadId);
							return values;
						}),
					);
				},
			};
		}),
	},
) {}
