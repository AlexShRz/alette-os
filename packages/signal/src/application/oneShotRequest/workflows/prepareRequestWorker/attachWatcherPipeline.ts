import { EventBus } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { AggregateRequestWatchers } from "../../../../domain/execution/events/preparation/AggregateRequestWatchers";
import { WatcherPipelineConfig } from "../../../../domain/execution/services/watchers/WatcherPipelineConfig";
import { RequestWorker } from "../../../../domain/execution/worker/RequestWorker";
import { PrepareRequestWorkerArguments } from "./PrepareRequestWorkerArguments";

export const attachRequestWatcherPipeline = (worker: RequestWorker) =>
	E.gen(function* () {
		const { controller } = yield* PrepareRequestWorkerArguments;
		const requestControllerId = controller.getId();
		const controllerEventBus = yield* EventBus;

		if (yield* worker.isWatchedBy(requestControllerId)) {
			return;
		}

		const watchers = yield* controllerEventBus.send(
			new AggregateRequestWatchers(),
		);

		if (!(watchers instanceof AggregateRequestWatchers)) {
			return yield* E.dieMessage(
				'Expected returned event to be of type "AggregateRequestWatchers"',
			);
		}

		yield* worker.addWatchers(
			new WatcherPipelineConfig(controller, watchers.getWatchers()),
		);
	});
