import { EventBus } from "@alette/event-sourcing";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import { TSessionEvent } from "../../events/SessionEvent";
import { RequestStateTimeline } from "../timeline/RequestStateTimeline";
import { WatcherPipelineConfig } from "./WatcherPipelineConfig";

export class WatcherPipeline extends E.Service<WatcherPipeline>()(
	"WatcherPipeline",
	{
		effect: (config: WatcherPipelineConfig) =>
			E.gen(function* () {
				const id = config.getId();
				const controllerEventReceiver = config.getEventReceiver();
				const scope = yield* Scope.make();
				const timeline = yield* E.serviceOptional(RequestStateTimeline);

				const pipeline = yield* EventBus.makeAsValue(
					EventBus.Default(config.getWatchers()),
				).pipe(Scope.extend(scope));
				pipeline.broadcast((e) => controllerEventReceiver.offer(e));

				const send = <T extends TSessionEvent>(event: T) => {
					return pipeline.send(event);
				};

				yield* E.zipRight(
					/**
					 * 1. Replay all recent events to self and then
					 * subscribe to next broadcasts.
					 * 2. Make sure replayed/broadcast events are cloned
					 * */
					timeline.replay((e) => send(e.clone())),
					timeline.broadcast().pipe(
						/**
						 * 3. Start listening for new events
						 * */
						Stream.runForEach((event) => send(event.clone())),
						Stream.runDrain,
					),
				).pipe(E.forkIn(scope));

				return {
					getId() {
						return id;
					},

					send,

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
