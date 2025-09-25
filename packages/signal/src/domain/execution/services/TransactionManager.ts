import * as E from "effect/Effect";
import type { Semaphore } from "effect/Effect";
import * as SynchronizedRef from "effect/SynchronizedRef";

export class TransactionManager extends E.Service<TransactionManager>()(
	"TransactionManager",
	{
		scoped: E.gen(function* () {
			const semaphores = yield* SynchronizedRef.make<Record<string, Semaphore>>(
				{},
			);

			const getOrThrow = (key: string) =>
				semaphores.get.pipe(
					E.andThen(
						E.fn(function* (s) {
							const current = s[key];

							if (!current) {
								return yield* E.dieMessage(
									`Could not get transaction semaphore for transaction "${key}".`,
								);
							}

							return current;
						}),
					),
				);

			const getOrCreateSemaphore = (key: string) =>
				SynchronizedRef.getAndUpdateEffect(
					semaphores,
					E.fn(function* (all) {
						const current = all[key];

						if (current) {
							return all;
						}

						all[key] = yield* E.makeSemaphore(1);
						return all;
					}),
				).pipe(E.andThen(() => getOrThrow(key)));

			return {
				run<A, E, R>(transactionKey: string, task: E.Effect<A, E, R>) {
					return E.gen(function* () {
						const semaphore = yield* getOrCreateSemaphore(transactionKey);
						return yield* semaphore.withPermits(1)(task);
					});
				},
			};
		}),
	},
) {}
