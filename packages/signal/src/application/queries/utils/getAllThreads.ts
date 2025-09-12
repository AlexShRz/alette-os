import * as E from "effect/Effect";
import { RequestThread } from "../../../domain/execution/RequestThread";
import { getAllThreadRegistries } from "./getAllThreadRegistries";

export const getAllThreads = E.gen(function* () {
	const registries = yield* getAllThreadRegistries;

	let threads: RequestThread[] = [];
	for (const registry of registries) {
		threads = [...threads, ...(yield* registry.getAll())];
	}
	return threads;
}).pipe(E.orDie, E.scoped);
