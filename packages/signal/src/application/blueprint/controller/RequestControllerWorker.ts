import { ManagedRuntime } from "effect";
import * as Chunk from "effect/Chunk";
import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { RequestWorker } from "../../../domain/execution/worker/RequestWorker";
import { RequestControllerSupervisor } from "./RequestControllerSupervisor";

type TWorkerInstance = RequestWorker | null;

export abstract class RequestControllerWorker<R, ER> {
	protected worker: SubscriptionRef.SubscriptionRef<TWorkerInstance>;

	protected constructor(
		protected runtime: ManagedRuntime.ManagedRuntime<R, ER>,
		protected lifecycle: RequestControllerSupervisor<R, ER>,
	) {
		this.worker = this.runtime.runSync(
			SubscriptionRef.make<TWorkerInstance>(null),
		);
	}

	protected getWorker() {
		const task = this.worker.changes.pipe(
			Stream.filter((worker) => !!worker),
			Stream.take(1),
			Stream.runCollect,
			E.andThen((c) => Chunk.unsafeGet(c, 0)),
		);

		return this.lifecycle.spawnAndSupervise(task);
	}

	protected setWorker(worker: RequestWorker) {
		return SubscriptionRef.set(this.worker, worker);
	}
}
