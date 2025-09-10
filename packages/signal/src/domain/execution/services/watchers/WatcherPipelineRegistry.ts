import * as E from "effect/Effect";
import * as RcMap from "effect/RcMap";
import { WatcherPipeline } from "./WatcherPipeline";
import { WatcherPipelineConfig } from "./WatcherPipelineConfig";

export class WatcherPipelineRegistry extends E.Service<WatcherPipelineRegistry>()(
	"WatcherOrchestrator",
	{
		scoped: E.gen(function* () {
			const pipelines = yield* RcMap.make({
				lookup: (config: WatcherPipelineConfig) =>
					E.acquireRelease(
						WatcherPipeline.makeAsValue(WatcherPipeline.Default(config)),
						(pipeline) => pipeline.shutdown(),
					),
			});

			return {
				has(id: string) {
					return RcMap.keys(pipelines).pipe(
						E.andThen((configs) => configs.some((c) => c.is(id))),
					);
				},

				set(config: WatcherPipelineConfig) {
					return RcMap.get(pipelines, config);
				},

				remove(id: string) {
					return E.gen(function* () {
						const configs = yield* RcMap.keys(pipelines);
						const config = configs.find((c) => c.is(id));

						if (config) {
							yield* RcMap.invalidate(pipelines, config);
						}
					});
				},
			};
		}),
	},
) {}
