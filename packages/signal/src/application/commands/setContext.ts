import * as E from "effect/Effect";
import { IGlobalContext } from "../../domain/context/IGlobalContext";
import { GlobalContext } from "../../domain/context/services/GlobalContext";
import { task } from "../../tasks/primitive/functions";

export const setContext = (newContext: IGlobalContext) =>
	task(() =>
		E.gen(function* () {
			const context = yield* E.serviceOptional(GlobalContext);
			context.set(newContext);
		}).pipe(E.orDie),
	);
