import * as E from "effect/Effect";
import { GlobalUrlConfig } from "../../domain/url/services/GlobalUrlConfig";
import { task } from "../../tasks/primitive/functions";

export const setOrigin = (origin: string) =>
	task(() =>
		E.gen(function* () {
			const config = yield* E.serviceOptional(GlobalUrlConfig);
			config.setOrigin(origin);
		}).pipe(E.orDie),
	);
