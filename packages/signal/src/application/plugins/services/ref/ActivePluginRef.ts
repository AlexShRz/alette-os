import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Predicate from "effect/Predicate";
import * as Runtime from "effect/Runtime";
import * as Scope from "effect/Scope";
import {
	IPluginActivationHook,
	IPluginActivationHookData,
	IPluginDeactivationHook,
} from "../../ApiPluginBuilder";
import { IPluginRuntime } from "../../defineApiPlugin";
import { Runnable } from "../../runnable/Runnable";
import { TaskScheduler } from "../../tasks/TaskScheduler";
import { task } from "../../tasks/primitive/functions";
import { PluginMailbox } from "../PluginMailbox";

export class ActivePluginRef {
	/**
	 * 1. This scope acts as a reference for PluginRegistry
	 * 2. The moment the scope is closed, the ActivePlugin layer is
	 * shutdown
	 * */
	protected activePluginScope: Scope.CloseableScope;
	protected wasShutdown = false;

	constructor(
		protected config: {
			pluginName: string;
			pluginMailbox: ReturnType<PluginMailbox["get"]>;
			runtime: IPluginRuntime;
			activationHooks: IPluginActivationHook[];
			deactivationHooks: IPluginDeactivationHook[];
		},
	) {
		this.activePluginScope = this.config.runtime.runSync(Scope.make());
		this.config.runtime.runSync(
			Scope.addFinalizer(
				this.activePluginScope,
				E.sync(() => {
					this.wasShutdown = true;
				}),
			),
		);
	}

	isAlive() {
		return !this.wasShutdown;
	}

	activate() {
		const self = this;
		return E.gen(function* () {
			yield* self.scheduleActivationHooks();
			yield* self.scheduleDeactivationHooks();
		}).pipe(Scope.extend(this.activePluginScope));
	}

	getName() {
		return this.config.pluginName;
	}

	getMailbox() {
		return this.config.pluginMailbox;
	}

	getScope() {
		return this.activePluginScope;
	}

	invalidate() {
		return Scope.close(this.activePluginScope, Exit.void);
	}

	protected scheduleActivationHooks() {
		return this.scheduleHookExecution(this.config.activationHooks);
	}

	protected scheduleDeactivationHooks() {
		return E.gen(this, function* () {
			const taskScheduler = yield* TaskScheduler;

			yield* E.addFinalizer(() =>
				this.scheduleHookExecution(this.config.deactivationHooks).pipe(
					E.provideService(TaskScheduler, taskScheduler),
				),
			);
		});
	}

	protected scheduleHookExecution(
		hooks: IPluginDeactivationHook[] | IPluginActivationHook[],
	) {
		return E.gen(this, function* () {
			const scheduler = yield* TaskScheduler;
			/**
			 * DO NOT USE RUNTIME FROM THE CONFIG!
			 * 1. Otherwise, we will enter a deadlock
			 * 2. TODO: Have no idea why at the moment - research later?
			 * */
			const runtime = yield* E.runtime<never>();
			const hook = task(() =>
				E.gen(this, function* () {
					/**
					 * NOTE: every command/query should be
					 * executed in the "sequential" mode.
					 * */
					const hookOptions: IPluginActivationHookData = {
						ask: (task) =>
							Runtime.runPromise(
								runtime,
								E.gen(function* () {
									const runnable = task.build();
									yield* scheduler.scheduleHighPriority(runnable);
									return yield* runnable.result();
								}),
							),
						tell: (task) =>
							Runtime.runSync(
								runtime,
								E.gen(function* () {
									yield* scheduler.scheduleHighPriority(task.build());
								}),
							),
					};

					const boundHooks = hooks.map((hook) => {
						return E.async<void, never>((resume) => {
							const maybePromise = hook(hookOptions);

							if (Predicate.isPromise(maybePromise)) {
								maybePromise.finally(() => resume(E.succeed(E.void)));
							} else {
								resume(E.succeed(maybePromise));
							}
						});
					});

					/**
					 * IMPORTANT - make sure we use the plugin runtime here,
					 * otherwise the whole program will enter a deadlock if
					 * our hooks contain ask().
					 * No idea why this happens, research later?
					 * */
					Runtime.runFork(runtime, E.all(boundHooks));
				}),
			);

			/**
			 * 1. Make sure to put hooks into "high priority" queue
			 * 2. We should treat them as top level query/commands (api.ask()/tell())
			 * */
			yield* scheduler.scheduleHighPriority(
				hook.build() as unknown as Runnable<any, any>,
			);
		});
	}
}
