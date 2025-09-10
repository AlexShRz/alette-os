import * as E from "effect/Effect";
import { RequestThreadRegistry } from "../../domain/execution/RequestThreadRegistry";
import { TRecognizedApiDuration } from "../../shared";
import { task } from "../plugins/tasks/primitive/functions";

export const setRequestThreadTTL = (ttl: TRecognizedApiDuration) =>
	task(() =>
		E.gen(function* () {
			const registry = yield* E.serviceOptional(RequestThreadRegistry);
			registry.setThreadTTL(ttl);
		}).pipe(E.orDie),
	);
