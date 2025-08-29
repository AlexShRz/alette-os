import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import { RequestWatcher } from "../interceptors/watchers/RequestWatcher";

interface IWatcherPipelineArgs {
	id: string;
	watchers: RequestWatcher[];
}

export class WatcherPipeline extends E.Service<WatcherPipeline>()(
	"WatcherPipeline",
	{
		effect: E.fn(function* ({ id }: IWatcherPipelineArgs) {
			const scope = yield* Scope.make();

			return {
				getId() {
					return id;
				},

				shutdown() {
					return E.gen(function* () {
						yield* Scope.close(scope, Exit.void);
					});
				},
			};
		}),
	},
) {
	static makeAsValue(worker: Layer.Layer<WatcherPipeline>) {
		return Layer.build(worker).pipe(
			E.andThen((c) => Context.unsafeGet(c, WatcherPipeline)),
		);
	}
}
