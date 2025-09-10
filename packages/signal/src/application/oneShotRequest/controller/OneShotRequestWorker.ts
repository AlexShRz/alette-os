import { ManagedRuntime } from "effect";
import * as E from "effect/Effect";
import { TSessionEvent } from "../../../domain/execution/events/SessionEvent";
import { RequestControllerWorker } from "../../blueprint/controller/RequestControllerWorker";
import { PrepareRequestWorker } from "../workflows/prepareRequestWorker/PrepareRequestWorker";
import { PrepareRequestWorkerArguments } from "../workflows/prepareRequestWorker/PrepareRequestWorkerArguments";
import { OneShotRequestSupervisor } from "./OneShotRequestSupervisor";

export class OneShotRequestWorker<R, ER> extends RequestControllerWorker<
	R,
	ER
> {
	constructor(
		runtime: ManagedRuntime.ManagedRuntime<R, ER>,
		lifecycle: OneShotRequestSupervisor<R, ER>,
		protected config: Omit<PrepareRequestWorkerArguments["Type"], "workerId">,
	) {
		super(runtime, lifecycle);
		this.prepare();
	}

	protected prepare() {
		return this.lifecycle.spawnAndSupervise(
			PrepareRequestWorker.send(this.config).pipe(
				E.andThen((worker) => this.setWorker(worker)),
			),
		);
	}

	dispatch<T extends TSessionEvent>(event: T) {
		return E.gen(this, function* () {
			const worker = yield* this.getWorker();
			yield* worker.dispatch(event);
		});
	}
}
