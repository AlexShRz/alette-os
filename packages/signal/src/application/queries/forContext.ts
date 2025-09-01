import * as E from "effect/Effect";
import { GlobalContext } from "../../domain/context/services/GlobalContext";
import { queryTask } from "../../tasks/primitive/functions";

export const forContext = () =>
	queryTask(() =>
		E.gen(function* () {
			const context = yield* E.serviceOptional(GlobalContext);
			return context.get();
		}).pipe(E.orDie),
	);
