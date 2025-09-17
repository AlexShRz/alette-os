import { ExecutionStrategy } from "effect";
import * as E from "effect/Effect";
import * as LayerMap from "effect/LayerMap";
import * as RcMap from "effect/RcMap";
import * as Scope from "effect/Scope";
import { RequestWorker } from "./worker/RequestWorker";
import { RequestWorkerConfig } from "./worker/RequestWorkerConfig";

export class RequestThread extends E.Service<RequestThread>()("RequestThread", {
	scoped: E.fn(function* (id: string) {
		const scope = yield* E.scope;
		/**
		 * 1. We shouldn't provide idle TTL here -
		 * the worker should be removed IMMEDIATELY if
		 * its ref count reaches zero.
		 * 2. If we have 2 subscriptions operating using the
		 * same worker, the worker will be removed the moment
		 * every subscription has been disposed of.
		 * */
		const workers = yield* LayerMap.make((config: RequestWorkerConfig) =>
			RequestWorker.Default(config),
		);

		return {
			getIdsOfSupervisedWorkers() {
				return RcMap.keys(workers.rcMap).pipe(
					E.andThen((configs) => configs.map((c) => c.getId())),
				);
			},

			getId() {
				return id;
			},

			getOrCreateWorkerRuntime(workerConfig: RequestWorkerConfig) {
				return workers.runtime(workerConfig);
			},

			getScope() {
				return Scope.fork(scope, ExecutionStrategy.sequential);
			},

			removeWorker(workerId: string) {
				return workers.invalidate(new RequestWorkerConfig(workerId));
			},
		};
	}),
}) {}
