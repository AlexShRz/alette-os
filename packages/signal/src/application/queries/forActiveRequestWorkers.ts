import * as E from "effect/Effect";
import { RequestThreadRegistry } from "../../domain/execution/RequestThreadRegistry";
import { queryTask } from "../plugins/tasks/primitive/functions";

export const forActiveRequestWorkers = () =>
	queryTask(
		E.gen(function* () {
			const registry = yield* E.serviceOptional(RequestThreadRegistry);
			const threads = yield* registry.getAll();

			let activeWorkerIds: string[] = [];
			for (const thread of threads) {
				const ids = yield* thread.getIdsOfSupervisedWorkers();
				activeWorkerIds = [...activeWorkerIds, ...ids];
			}

			return activeWorkerIds;
		}).pipe(E.scoped, E.orDie),
	);
