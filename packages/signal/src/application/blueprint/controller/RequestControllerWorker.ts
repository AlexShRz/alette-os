import { ManagedRuntime } from "effect";
import * as E from "effect/Effect";
import { Latch } from "effect/Effect";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { RequestWorker } from "../../../domain/execution/RequestWorker";
import { RequestControllerLifecycle } from "./RequestControllerLifecycle";

type TWorkerInstance = RequestWorker | null;

export abstract class RequestControllerWorker<R, ER> {
	protected worker: SubscriptionRef.SubscriptionRef<TWorkerInstance>;
	protected workerLatch: Latch;

	protected constructor(
		protected runtime: ManagedRuntime.ManagedRuntime<R, ER>,
		protected lifecycle: RequestControllerLifecycle<R, ER>,
	) {
		this.workerLatch = this.runtime.runSync(E.makeLatch(false));
		this.worker = this.runtime.runSync(
			SubscriptionRef.make<TWorkerInstance>(null),
		);
		this.waitForWorkerInit();
	}

	protected getWorker() {
		return this.worker.get
			.pipe(
				E.andThen((worker) =>
					worker
						? E.succeed(worker)
						: E.dieMessage(
								"[RequestControllerWorker] - request worker is null.",
							),
				),
			)
			.pipe(this.workerLatch.whenOpen);
	}

	protected waitForWorkerInit() {
		return this.lifecycle.spawnAndSupervise(
			this.worker.changes.pipe(
				Stream.filter((worker) => !!worker),
				Stream.tap(() => this.workerLatch.open),
				Stream.take(1),
				Stream.runDrain,
				E.forkScoped,
			),
		);
	}
}
