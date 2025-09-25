import { EventBus } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import { TSessionEvent } from "../../events/SessionEvent";
import { RequestStateTimeline } from "../timeline/RequestStateTimeline";
import { WatcherPipelineConfig } from "./WatcherPipelineConfig";

export class WatcherPipeline extends E.Service<WatcherPipeline>()(
	"WatcherPipeline",
	{
		scoped: (config: WatcherPipelineConfig) =>
			E.gen(function* () {
				const id = config.getId();
				const controllerStateManager = config.getStateManager();
				const timeline = yield* E.serviceOptional(RequestStateTimeline);
				const pipelineBus = yield* EventBus;

				/**
				 * When all watchers have processed the request event,
				 * send the event to our controller
				 * */
				pipelineBus.broadcast((e) => {
					if (e.isCancelled()) {
						return E.void;
					}

					return controllerStateManager.applyStateSnapshot(e);
				});

				const sendToPipeline = <T extends TSessionEvent>(event: T) => {
					return pipelineBus.send(event);
				};

				yield* E.zipRight(
					/**
					 * 1. Replay all recent events to self and then
					 * subscribe to next broadcasts.
					 * 2. Make sure replayed/broadcast events are cloned
					 * */
					timeline.replay((e) => sendToPipeline(e.clone())),
					timeline.updates().pipe(
						/**
						 * 3. Start listening for new events
						 * */
						Stream.runForEach((event) => sendToPipeline(event.clone())),
						Stream.runDrain,
					),
				).pipe(E.forkScoped);

				return {
					getId() {
						return id;
					},

					send: sendToPipeline,
				};
			}).pipe(E.orDie),
	},
) {}
