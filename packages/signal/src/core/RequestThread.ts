import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as RcRef from "effect/RcRef";
import * as Scope from "effect/Scope";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { RequestWorker } from "./RequestWorker";

const REQUEST_WORKER_TTL = "15 seconds";

export class RequestThread extends E.Service<RequestThread>()("RequestThread", {
	effect: E.fn(function* (id: string) {
		const scope = yield* Scope.make();
		const workers = yield* SynchronizedRef.make(
			new Map<string, RcRef.RcRef<RequestWorker>>(),
		);

		return {
			isSupervisingWorker(workerId: string) {
				return workers.get.pipe(E.andThen((dict) => dict.has(workerId)));
			},

			getIdsOfSupervisedWorkers() {
				return workers.get.pipe(E.andThen((registry) => [...registry.keys()]));
			},

			getId() {
				return id;
			},

			getWorkerOrThrow(workerId: string) {
				return E.gen(function* () {
					const registry = yield* workers.get;
					const worker = registry.get(workerId);

					if (!worker) {
						return yield* E.die(new Cause.IllegalArgumentException(workerId));
					}

					return yield* worker.get;
				});
			},

			getOrCreateWorkerFrom(
				workerId: string,
				createWorker: E.Effect<Layer.Layer<RequestWorker>>,
			) {
				return SynchronizedRef.getAndUpdateEffect(workers, (registry) =>
					E.gen(this, function* () {
						const worker = registry.get(workerId);

						if (worker) {
							return registry;
						}

						const workerLayer = yield* createWorker;
						const ref = yield* RcRef.make({
							acquire: E.acquireRelease(
								RequestWorker.makeAsValue(workerLayer),
								(w) => this.removeWorker(w.getId()),
							),
							idleTimeToLive: REQUEST_WORKER_TTL,
						});

						registry.set(workerId, ref);
						return registry;
					}).pipe(Scope.extend(scope)),
				).pipe(E.andThen(() => this.getWorkerOrThrow(workerId)));
			},

			removeWorker(workerId: string) {
				return SynchronizedRef.getAndUpdateEffect(workers, (registry) =>
					E.gen(function* () {
						const worker = registry.get(workerId);

						if (!worker) {
							return registry;
						}

						const instance = yield* worker.get;
						yield* instance.shutdown();
						registry.delete(workerId);
						return registry;
					}).pipe(E.scoped),
				);
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
