import * as E from "effect/Effect";
import { TSessionEvent } from "../../../domain/execution/events/SessionEvent";
import { RequestControllerWorker } from "../../blueprint/controller/RequestControllerWorker";
import { ApiPlugin } from "../../plugins/ApiPlugin";
import { PrepareRequestWorkerArguments } from "../workflows/prepareRequestWorker/PrepareRequestWorkerArguments";
import { prepareRequestWorker } from "../workflows/prepareRequestWorker/prepareRequestWorker";

export class OneShotRequestWorker extends RequestControllerWorker {
	constructor(
		plugin: ApiPlugin,
		protected config: Omit<
			PrepareRequestWorkerArguments["Type"],
			"workerId" | "pluginName"
		>,
	) {
		super(plugin);
		this.prepare();
	}

	protected prepare() {
		return this.plugin
			.getScheduler()
			.schedule(
				prepareRequestWorker(this.config).pipe(
					E.andThen((workerConfig) => this.setWorkerConfig(workerConfig)),
				),
			);
	}

	dispatch<T extends TSessionEvent>(event: T) {
		return E.gen(this, function* () {
			const { worker } = yield* this.getWorkerConfig();
			yield* worker.dispatch(event);
		});
	}
}
