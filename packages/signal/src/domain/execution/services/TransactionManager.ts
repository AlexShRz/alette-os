import * as E from "effect/Effect";
import * as RcMap from "effect/RcMap";
import { RequestRecognizedErrors } from "./meta/RequestRecognizedErrors";
import { RequestValueAdapters } from "./meta/RequestValueAdapters";

export const TRANSACTION_SEMAPHORE_TTL = "5 seconds";

export class TransactionManager extends E.Service<TransactionManager>()(
	"TransactionManager",
	{
		dependencies: [
			RequestRecognizedErrors.Default,
			RequestValueAdapters.Default,
		],
		scoped: E.gen(function* () {
			const semaphores = yield* RcMap.make({
				lookup: (_: string) =>
					E.acquireRelease(
						E.makeSemaphore(1),
						(semaphore) => semaphore.releaseAll,
					),
				idleTimeToLive: TRANSACTION_SEMAPHORE_TTL,
			});

			return {
				run<A, E, R>(transactionKey: string, task: E.Effect<A, E, R>) {
					return E.gen(function* () {
						const semaphore = yield* RcMap.get(semaphores, transactionKey);
						return yield* semaphore.withPermits(1)(task);
					});
				},
			};
		}),
	},
) {}
