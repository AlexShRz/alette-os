import * as E from "effect/Effect";
import { queryTask } from "../plugins/tasks/primitive/functions";
import { getAllThreads } from "./utils/getAllThreads";

export const forActiveRequestWorkers = () =>
	queryTask(() =>
		E.gen(function* () {
			const threads = yield* getAllThreads;

			let activeWorkerIds: string[] = [];
			for (const thread of threads) {
				const ids = yield* thread.getIdsOfSupervisedWorkers();
				activeWorkerIds = [...activeWorkerIds, ...ids];
			}

			return activeWorkerIds;
		}).pipe(E.scoped, E.orDie),
	);
