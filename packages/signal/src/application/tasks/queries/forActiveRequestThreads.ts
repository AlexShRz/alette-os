import * as E from "effect/Effect";
import { queryTask } from "../../plugins/tasks/primitive/functions";
import { getAllThreadRegistries } from "./utils/getAllThreadRegistries";

export const forActiveRequestThreads = () =>
	queryTask(
		E.gen(function* () {
			const threadRegistries = yield* getAllThreadRegistries;

			let threadIds: string[] = [];
			for (const registry of threadRegistries) {
				threadIds = [...threadIds, ...(yield* registry.getIds())];
			}

			return threadIds;
		}).pipe(E.orDie, E.scoped),
	);
