import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { RequestSession } from "./RequestSession";
import { WatcherPipeline } from "./WatcherPipeline";

export class WatcherOrchestrator extends E.Service<WatcherOrchestrator>()(
	"WatcherOrchestrator",
	{
		scoped: E.gen(function* () {
			const scope = yield* E.scope;
			const session = yield* RequestSession;

			return {
				has(pipelineId: string) {
					return E.gen(function* () {
						return false;
					});
				},

				set(pipelineId: string, pipeline: Layer.Layer<WatcherPipeline>) {
					return E.gen(function* () {});
				},

				remove(pipelineId: string) {
					return E.gen(function* () {});
				},
			};
		}),
	},
) {}
