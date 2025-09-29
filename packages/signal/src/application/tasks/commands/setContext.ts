import * as E from "effect/Effect";
import { IGlobalContext } from "../../../domain";
import { GlobalContext } from "../../../domain/context/services/GlobalContext";
import { task } from "../../plugins/tasks/primitive/functions";

export const setContext = (newContext: IGlobalContext) =>
	task(
		E.gen(function* () {
			const context = yield* E.serviceOptional(GlobalContext);
			yield* context.set(newContext);
		}).pipe(E.orDie),
	);
