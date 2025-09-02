import * as E from "effect/Effect";
import { GlobalUrlConfig } from "../../domain/url/services/GlobalUrlConfig";
import { queryTask } from "../plugins/tasks/primitive/functions";

export const forOrigin = () =>
	queryTask(() =>
		E.gen(function* () {
			const config = yield* E.serviceOptional(GlobalUrlConfig);
			return config.getOrigin();
		}).pipe(E.orDie),
	);
