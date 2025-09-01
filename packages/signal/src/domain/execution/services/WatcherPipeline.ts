import { EventBus } from "@alette/event-sourcing";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import { RequestController } from "../../../application/blueprint/controller/RequestController";
import { RequestWatcher } from "../../watchers/RequestWatcher";
import { WatcherOrchestrator } from "./WatcherOrchestrator";

interface IWatcherPipelineArgs {
	controller: RequestController<any>;
	watchers: RequestWatcher[];
}

export class WatcherPipeline extends E.Service<WatcherPipeline>()(
	"WatcherPipeline",
	{
		effect: ({ watchers, controller }: IWatcherPipelineArgs) =>
			E.gen(function* () {
				const id = controller.getId();
				const scope = yield* Scope.make();
				const controllerEventReceiver = controller.getEventReceiver();
				const orchestrator = yield* E.serviceOptional(WatcherOrchestrator);

				const pipeline = yield* EventBus.makeAsValue(
					EventBus.Default(watchers),
				).pipe(Scope.extend(scope));
				pipeline.broadcast(controllerEventReceiver.offer);

				yield* Scope.addFinalizer(scope, orchestrator.remove(id));

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
			}).pipe(E.orDie),
	},
) {
	static makeAsValue(pipeline: Layer.Layer<WatcherPipeline>) {
		return Layer.build(pipeline).pipe(
			E.andThen((c) => Context.unsafeGet(c, WatcherPipeline)),
		);
	}
}
