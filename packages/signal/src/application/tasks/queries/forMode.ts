import * as E from "effect/Effect";
import { EnvironmentMode } from "../../../domain/environment/EnvironmentMode";
import { orPanic } from "../../../domain/errors/utils/orPanic";
import { queryTask } from "../../plugins/tasks/primitive/functions";

export const forMode = () =>
	queryTask(
		E.gen(function* () {
			const environment = yield* E.serviceOptional(EnvironmentMode);
			return yield* environment.get();
		}).pipe(orPanic),
	);
