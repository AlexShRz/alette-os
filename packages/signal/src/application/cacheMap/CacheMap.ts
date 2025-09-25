import * as E from "effect/Effect";
import { v4 as uuid } from "uuid";
import { CachePolicy } from "../../domain/cache/policy";
import { TRecognizedApiDuration } from "../../shared";
import { PluginTaskScheduler } from "../plugins/PluginTaskScheduler";

export class CacheMap<CacheableValue = unknown> {
	constructor(
		protected scheduler: PluginTaskScheduler,
		protected config: {
			id: string;
			policy: CachePolicy<CacheableValue>;
			capacity: number;
			entityPruningTimeout: TRecognizedApiDuration;
		},
	) {}
}
