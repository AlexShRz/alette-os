import * as Chunk from "effect/Chunk";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Queue from "effect/Queue";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { ActiveApiPlugin } from "./services/ActiveApiPlugin";

type TActivatedPlugin = ActiveApiPlugin | null;

export class PluginTaskScheduler {
	protected mailbox: Queue.Queue<E.Effect<unknown>>;
	protected schedulerRuntime: ManagedRuntime.ManagedRuntime<Scope.Scope, never>;
	protected activePlugin: SubscriptionRef.SubscriptionRef<TActivatedPlugin>;

	constructor(protected pluginName: string) {
		this.schedulerRuntime = ManagedRuntime.make(Layer.scope);
		this.mailbox = this.schedulerRuntime.runSync(Queue.unbounded());
		this.activePlugin = this.schedulerRuntime.runSync(
			SubscriptionRef.make<TActivatedPlugin>(null),
		);
		this.schedulerRuntime.runFork(this.processTasks());
	}

	protected getPlugin() {
		return this.activePlugin.changes.pipe(
			Stream.filter((plugin) => !!plugin),
			Stream.take(1),
			Stream.runCollect,
			E.andThen((c) => Chunk.unsafeGet(c, 0)),
		);
	}

	setActivePlugin(plugin: ActiveApiPlugin) {
		return SubscriptionRef.set(this.activePlugin, plugin);
	}

	protected processTasks() {
		return Stream.fromQueue(this.mailbox).pipe(
			Stream.tap((task) =>
				E.gen(this, function* () {
					const plugin = yield* this.getPlugin();
					return yield* plugin.runWithSupervision(task);
				}),
			),
			Stream.runDrain,
			E.forkScoped,
		);
	}

	schedule<A, E, R>(task: E.Effect<A, E, R>) {
		this.schedulerRuntime.runFork(
			this.mailbox.offer(task as E.Effect<unknown>),
		);
	}

	runSync<A, E>(task: E.Effect<A, E, never>) {
		return this.schedulerRuntime.runSync(task);
	}
}
