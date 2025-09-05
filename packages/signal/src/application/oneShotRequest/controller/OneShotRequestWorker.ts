import { ManagedRuntime } from "effect";
import * as E from "effect/Effect";
import { RequestSessionEvent } from "../../../domain/execution/events/RequestSessionEvent";
import { RequestControllerWorker } from "../../blueprint/controller/RequestControllerWorker";
import { PluginMailbox } from "../../plugins/PluginMailbox";
import { PrepareRequestWorker } from "../../workflows/PrepareRequestWorker";
import { OneShotRequestLifecycle } from "./OneShotRequestLifecycle";

export class OneShotRequestWorker<R, ER> extends RequestControllerWorker<
	R,
	ER
> {
	constructor(
		runtime: ManagedRuntime.ManagedRuntime<R, ER>,
		lifecycle: OneShotRequestLifecycle<R, ER>,
		protected config: Parameters<typeof PrepareRequestWorker.make>[number],
	) {
		super(runtime, lifecycle);
		this.prepare();
	}

	protected prepare() {
		const task = E.gen(function* () {
			const pluginMailbox = yield* PluginMailbox;
			const workflow = yield* PrepareRequestWorker;
			return yield* pluginMailbox.sendQuery(workflow);
		}).pipe(E.provide(PrepareRequestWorker.make(this.config)));

		return this.lifecycle.spawnAndSupervise(task);
	}

	dispatch<T extends RequestSessionEvent>(event: T) {
		return E.gen(this, function* () {
			const worker = yield* this.getWorker();
			yield* worker.dispatch(event);
		});
	}
}
