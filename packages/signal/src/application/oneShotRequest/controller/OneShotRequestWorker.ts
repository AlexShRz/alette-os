import * as E from "effect/Effect";
import { TSessionEvent } from "../../../domain/execution/events/SessionEvent";
import { RequestControllerWorker } from "../../blueprint/controller/RequestControllerWorker";
import { ApiPlugin } from "../../plugins/ApiPlugin";
import { PrepareRequestWorker } from "../workflows/prepareRequestWorker/PrepareRequestWorker";
import { PrepareRequestWorkerArguments } from "../workflows/prepareRequestWorker/PrepareRequestWorkerArguments";
import { OneShotRequestSupervisor } from "./OneShotRequestSupervisor";

export class OneShotRequestWorker extends RequestControllerWorker {
	constructor(
		plugin: ApiPlugin,
		lifecycle: OneShotRequestSupervisor,
		protected config: Omit<
			PrepareRequestWorkerArguments["Type"],
			"workerId" | "pluginName"
		>,
	) {
		super(plugin, lifecycle);
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
