import { EventBus } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { RequestThread } from "../../../../domain/execution/RequestThread";
import { AggregateRequestMiddleware } from "../../../../domain/execution/events/preparation/AggregateRequestMiddleware";
import { ChooseRequestWorker } from "../../../../domain/execution/events/preparation/ChooseRequestWorker";
import { TransactionManager } from "../../../../domain/execution/services/TransactionManager";
import { RequestWorker } from "../../../../domain/execution/worker/RequestWorker";
import { RequestWorkerConfig } from "../../../../domain/execution/worker/RequestWorkerConfig";
import { PrepareRequestWorkerArguments } from "./PrepareRequestWorkerArguments";

const createRequestWorkerConfig = E.fn(function* (
	passedWorkerId: string,
	existingWorkers: string[],
) {
	const controllerEventBus = yield* EventBus;
	const { requestMode } = yield* PrepareRequestWorkerArguments;

	/**
	 * Make sure we don't execute middleware aggregation logic
	 * when we try to reuse our worker
	 * */
	if (existingWorkers.includes(passedWorkerId)) {
		return new RequestWorkerConfig(passedWorkerId, requestMode);
	}

	const aggregatedMiddleware = yield* controllerEventBus.send(
		new AggregateRequestMiddleware(),
	);

	if (!(aggregatedMiddleware instanceof AggregateRequestMiddleware)) {
		return yield* E.dieMessage(
			'Expected returned event to be of type "AggregateRequestMiddleware"',
		);
	}

	return new RequestWorkerConfig(
		passedWorkerId,
		requestMode,
		aggregatedMiddleware.getMiddleware(),
	);
});

export const createOrGetRequestWorker = E.fn(function* (thread: RequestThread) {
	const transactionManager = yield* E.serviceOptional(TransactionManager);
	const { workerId: initialWorkerId } = yield* PrepareRequestWorkerArguments;

	/**
	 * IMPORTANT:
	 * 1. Worker acquisition MUST be wrapped in a transaction.
	 * 2. For example, 10000 requests might require the same worker if
	 * request state sharing is on.
	 * It makes no sense to run the same worker acquisition 10000 times -
	 * we will encounter multiple concurrency issues, etc.
	 * */
	return yield* transactionManager.run(
		`PrepareRequestWorker-acquireWorker-${initialWorkerId}`,
		E.gen(function* () {
			const allWorkers = yield* thread.getIdsOfSupervisedWorkers();
			const controllerEventBus = yield* EventBus;

			const result = yield* controllerEventBus.send(
				new ChooseRequestWorker({
					preferred: initialWorkerId,
					availableWorkerIds: allWorkers,
				}),
			);

			if (!(result instanceof ChooseRequestWorker)) {
				return yield* E.dieMessage(
					'Expected returned event to be of type "ChooseRequestWorker"',
				);
			}

			const workerId = result.getPreferredWorker();
			const workerConfig = yield* createRequestWorkerConfig(
				workerId,
				allWorkers,
			);
			return yield* E.serviceOptional(RequestWorker).pipe(
				E.provide(yield* thread.getOrCreateWorkerRuntime(workerConfig)),
			);
		}),
	);
});
