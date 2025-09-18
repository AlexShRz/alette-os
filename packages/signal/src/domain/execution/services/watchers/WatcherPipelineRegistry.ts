import { EventBus } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LayerMap from "effect/LayerMap";
import * as RcMap from "effect/RcMap";
import { WatcherPipeline } from "./WatcherPipeline";
import { WatcherPipelineConfig } from "./WatcherPipelineConfig";

export class WatcherPipelineRegistry extends E.Service<WatcherPipelineRegistry>()(
	"WatcherOrchestrator",
	{
		scoped: E.gen(function* () {
			const pipelines = yield* LayerMap.make((config: WatcherPipelineConfig) =>
				WatcherPipeline.Default(config).pipe(
					/**
					 * 1. Make sure to use Layer.fresh() for event bus here,
					 * otherwise it will be created once and reused for every
					 * watcher pipeline.
					 * 2. This is NOT what we want, every pipeline must have
					 * its own event bus.
					 * */
					Layer.provide(Layer.fresh(EventBus.Default(config.getWatchers()))),
				),
			);

			return {
				has(id: string) {
					return RcMap.keys(pipelines.rcMap).pipe(
						E.andThen((configs) => configs.some((c) => c.is(id))),
					);
				},

				getOrCreateWatcherRuntime(config: WatcherPipelineConfig) {
					return pipelines.runtime(config);
				},

				remove(id: string) {
					return E.gen(function* () {
						const configs = yield* RcMap.keys(pipelines.rcMap);
						const config = configs.find((c) => c.is(id));

						if (config) {
							yield* pipelines.invalidate(config);
						}
					});
				},
			};
		}),
	},
) {}
