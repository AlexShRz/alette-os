import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as RcMap from "effect/RcMap";
import * as Scope from "effect/Scope";
import { RequestWorker } from "./worker/RequestWorker";
import { RequestWorkerConfig } from "./worker/RequestWorkerConfig";

export class RequestThread extends E.Service<RequestThread>()("RequestThread", {
	scoped: E.fn(function* (id: string) {
		const scope = yield* Scope.make();

		/**
		 * 1. We shouldn't provide idle TTL here -
		 * the worker should be removed IMMEDIATELY if
		 * its ref count reaches zero.
		 * 2. If we have 2 subscriptions operating using the
		 * same worker, the worker will be removed the moment
		 * every subscription has been disposed of.
		 * */
		const workers = yield* RcMap.make({
			lookup: (config: RequestWorkerConfig) =>
				E.acquireRelease(
					RequestWorker.makeAsValue(RequestWorker.Default(config)),
					(worker) => worker.shutdown(),
				),
		});

		return {
			getIdsOfSupervisedWorkers() {
				return RcMap.keys(workers).pipe(
					E.andThen((configs) => configs.map((c) => c.getId())),
				);
			},

			getId() {
				return id;
			},

			getOrCreateWorker(workerConfig: RequestWorkerConfig) {
				return RcMap.get(workers, workerConfig);
			},

			removeWorker(workerId: string) {
				return RcMap.invalidate(workers, new RequestWorkerConfig(workerId));
			},

			shutdown() {
				return E.gen(function* () {
					yield* Scope.close(scope, Exit.void);
				});
			},
		};
	}),
}) {
	static makeAsValue(worker: Layer.Layer<RequestThread>) {
		return Layer.build(worker).pipe(
			E.andThen((c) => Context.unsafeGet(c, RequestThread)),
		);
	}
}
