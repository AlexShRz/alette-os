import * as E from "effect/Effect";
import { queryTask } from "../plugins/tasks/primitive/functions";
import { getAllThreadRegistries } from "./utils/getAllThreadRegistries";

export const forRequestThreadRegistries = () =>
	queryTask(
		E.gen(function* () {
			const registries = yield* getAllThreadRegistries;
			return registries.map((r) => r.getId());
		}).pipe(E.orDie),
	);
