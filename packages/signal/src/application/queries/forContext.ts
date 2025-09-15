import * as E from "effect/Effect";
import { GlobalContext } from "../../domain/context/services/GlobalContext";
import { queryTask } from "../plugins/tasks/primitive/functions";

export const forContext = () =>
	queryTask(() =>
		E.gen(function* () {
			const context = yield* E.serviceOptional(GlobalContext);
			return yield* context.get();
		}).pipe(E.orDie),
	);
