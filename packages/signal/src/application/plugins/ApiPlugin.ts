import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Predicate from "effect/Predicate";
import * as Runtime from "effect/Runtime";
import {} from "uuid";
import {
	IApiPluginExposedUtils,
	IPluginActivationHook,
	IPluginActivationHookData,
	IPluginDeactivationHook,
	IPluginUtilProvider,
} from "./ApiPluginBuilder.js";
import { IPluginRuntime } from "./defineApiPlugin.js";
import { Runnable } from "./runnable/Runnable";
import { PluginMailbox } from "./services/PluginMailbox";
import { PluginName } from "./services/PluginName";
import { TaskScheduler } from "./tasks/TaskScheduler";
import { task } from "./tasks/primitive/functions";

export class ApiPlugin<
	Exposed extends IApiPluginExposedUtils = IApiPluginExposedUtils,
> {
	protected runtime: IPluginRuntime;

	constructor(
		protected config: {
			name: string;
			getExposed: IPluginUtilProvider<Exposed>;
			runtime: IPluginRuntime;
			activationHooks: IPluginDeactivationHook[];
			deactivationHooks: IPluginActivationHook[];
		},
	) {
		this.runtime = this.config.runtime;
	}

	protected getHookOptions() {
		return Fiber.join(
			this.runtime.runFork(
				E.gen(function* () {
					const mailbox = yield* PluginMailbox;
					return { mailbox };
				}),
			),
		);
	}

	/**
	 * Must be sync. Otherwise, will
	 * fail if triggered in another runtime.
	 * */
	getName() {
		return this.runtime.runSync(
			E.gen(function* () {
				return yield* PluginName.get();
			}),
		);
	}

	getNameAsync() {
		return this.runtime.runPromise(
			E.gen(function* () {
				return yield* PluginName.get();
			}),
		);
	}

	getMailboxHolder() {
		return Fiber.join(
			this.config.runtime.runFork(
				E.gen(function* () {
					return yield* PluginMailbox;
				}),
			),
		);
	}

	getMailbox() {
		return Fiber.join(
			this.config.runtime.runFork(
				E.gen(function* () {
					const mailbox = yield* PluginMailbox;
					return mailbox.get();
				}),
			),
		);
	}

	use() {
		return this.config.getExposed();
	}

	scheduleActivationHooks() {
		return this.scheduleHookExecution(this.config.activationHooks);
	}

	scheduleDeactivationHooks() {
		return this.scheduleHookExecution(this.config.deactivationHooks);
	}

	protected scheduleHookExecution(
		hooks: IPluginDeactivationHook[] | IPluginActivationHook[],
	) {
		return E.gen(this, function* () {
			const scheduler = yield* TaskScheduler;
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
