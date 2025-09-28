import * as E from "effect/Effect";
import { queryTask } from "../plugins/tasks/primitive/functions";
import { getAllThreadRegistries } from "./utils/getAllThreadRegistries";

export const forActiveThreadRegistries = () =>
	queryTask(
		E.gen(function* () {
			const threadRegistries = yield* getAllThreadRegistries;
			return threadRegistries.map((registry) => registry.getId());
		}).pipe(E.orDie, E.scoped),
	);
