import * as Chunk from "effect/Chunk";
import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { RequestWorker } from "../../../domain/execution/worker/RequestWorker";
import { ApiPlugin } from "../../plugins/ApiPlugin";

export interface IWorkerConfig {
	worker: RequestWorker;
	shutdown: () => E.Effect<void>;
}

export abstract class RequestControllerWorker {
	protected workerConfig: SubscriptionRef.SubscriptionRef<IWorkerConfig | null>;

	protected constructor(protected plugin: ApiPlugin) {
		this.workerConfig = this.plugin
			.getScheduler()
			.getOwnRuntime()
			.runSync(SubscriptionRef.make<IWorkerConfig | null>(null));
	}

	protected getWorkerConfig() {
		return this.workerConfig.changes.pipe(
			Stream.filter((workerConfig) => !!workerConfig),
			Stream.take(1),
			Stream.runCollect,
			E.andThen((c) => Chunk.unsafeGet(c, 0)),
		);
	}

	protected setWorkerConfig(config: IWorkerConfig) {
		return SubscriptionRef.set(this.workerConfig, config);
	}

	shutdown() {
		const task = E.gen(this, function* () {
			const workerConfig = yield* this.getWorkerConfig();
			yield* workerConfig.shutdown();
		});

		/**
		 * Must be runPromiseExit, otherwise the scope won't
		 * shut down.
		 * I have no clue why it needs to be a promise.
		 * */
		E.runPromiseExit(task).catch((e) => e);
	}
}
