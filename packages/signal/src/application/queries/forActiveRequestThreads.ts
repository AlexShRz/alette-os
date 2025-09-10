import * as E from "effect/Effect";
import { RequestThreadRegistry } from "../../domain/execution/RequestThreadRegistry";
import { queryTask } from "../plugins/tasks/primitive/functions";

export const forActiveRequestThreads = () =>
	queryTask(() =>
		E.gen(function* () {
			const registry = yield* E.serviceOptional(RequestThreadRegistry);
			return yield* registry.getIds();
		}).pipe(E.orDie, E.scoped),
	);
