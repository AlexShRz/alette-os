import { EventBus } from "@alette/event-sourcing";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import { v4 as uuid } from "uuid";
import { IRequestContext } from "../../domain/context/IRequestContext";
import { RequestThreadRegistry } from "../../domain/execution/RequestThreadRegistry";
import {
	RequestWorker,
	TRequestMode,
} from "../../domain/execution/RequestWorker";
import { AggregateRequestMiddleware } from "../../domain/execution/events/AggregateRequestMiddleware";
import { AggregateRequestWatchers } from "../../domain/execution/events/AggregateRequestWatchers";
import { ChooseRequestWorker } from "../../domain/execution/events/ChooseRequestWorker";
import { WatcherPipeline } from "../../domain/execution/services/WatcherPipeline";
import { RequestWatcher } from "../../domain/watchers/RequestWatcher";
import { RequestController } from "../blueprint/controller/RequestController";
import { QueryTaskBuilder } from "../plugins/tasks/primitive/QueryTaskBuilder";
import { queryTask } from "../plugins/tasks/primitive/functions";

interface IPrepareRequestWorkerArgs<Context extends IRequestContext> {
	threadId: string;
	requestMode: TRequestMode;
	controller: RequestController<Context>;
}

export class PrepareRequestWorker extends Context.Tag("PrepareRequestWorker")<
	PrepareRequestWorker,
	QueryTaskBuilder<RequestWorker>
>() {
	static make<Context extends IRequestContext>({
		controller,
		requestMode,
		threadId: workerSupervisor,
	}: IPrepareRequestWorkerArgs<Context>) {
		return Layer.effect(
			this,
			E.gen(function* () {
				const workflowScope = yield* E.scope;
				const controllerEventBus = yield* EventBus;
				const requestControllerId = controller.getId();
				const requestId = uuid();

				const attachRequestWatcherPipeline = ({
					worker,
					createWatcherPipeline,
				}: {
					worker: RequestWorker;
					createWatcherPipeline: (
						watchers: RequestWatcher[],
					) => Layer.Layer<WatcherPipeline>;
				}) =>
					E.gen(function* () {
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
							createWatcherPipeline(watchers.getWatchers()),
						);
					});

				const createRequestWorkerLayer = E.gen(function* () {
					const aggregatedMiddleware = yield* controllerEventBus.send(
						new AggregateRequestMiddleware(),
					);

					if (!(aggregatedMiddleware instanceof AggregateRequestMiddleware)) {
						return yield* E.dieMessage(
							'Expected returned event to be of type "AggregateRequestMiddleware"',
						);
					}

					return RequestWorker.Default({
						id: requestId,
						requestMode,
						middleware: aggregatedMiddleware.getMiddleware(),
					});
				});

				const createOrGetRequestWorker = E.gen(function* () {
					const threadRegistry = yield* E.serviceOptional(
						RequestThreadRegistry,
					);
					const thread = yield* threadRegistry.getOrThrow(workerSupervisor);
					const allWorkers = yield* thread.getIdsOfSupervisedWorkers();

					const result = yield* controllerEventBus.send(
						new ChooseRequestWorker({
							preferred: requestId,
							availableWorkerIds: allWorkers,
						}),
					);

					if (!(result instanceof ChooseRequestWorker)) {
						return yield* E.dieMessage(
							'Expected returned event to be of type "ChooseRequestWorker"',
						);
					}

					const workerId = result.getPreferredWorker();
					const workerLayer = yield* createRequestWorkerLayer;
					return yield* thread.getOrCreateWorkerFrom(workerId, workerLayer);
				}).pipe(E.orDie);

				const task = E.gen(function* () {
					const worker = yield* createOrGetRequestWorker;
					yield* attachRequestWatcherPipeline({
						worker,
						createWatcherPipeline: (watchers) =>
							WatcherPipeline.Default({
								controller,
								watchers,
							}),
					});
					return worker;
				}).pipe(Scope.extend(workflowScope));

				return queryTask(() => task).concurrent();
			}),
		);
	}
}
