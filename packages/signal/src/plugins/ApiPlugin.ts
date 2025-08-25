import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Predicate from "effect/Predicate";
import { queryTask, task } from "../tasks/functions";
import {
	IApiPluginExposedUtils,
	IPluginActivationHook,
	IPluginActivationHookData,
	IPluginDeactivationHook,
	IPluginUtilProvider,
} from "./ApiPluginBuilder.js";
import { IApiPluginMailboxMessage, PluginMailbox } from "./PluginMailbox.js";
import { PluginName } from "./PluginName.js";
import { IPluginRuntime } from "./defineApiPlugin.js";

export class ApiPlugin<
	Exposed extends IApiPluginExposedUtils = IApiPluginExposedUtils,
> {
	protected runtime: IPluginRuntime;

	constructor(
		protected config: {
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

	getName() {
		return Fiber.join(
			this.runtime.runFork(
				E.gen(function* () {
					return yield* PluginName.get();
				}),
			),
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

	runActivationHooks() {
		return Fiber.join(
			this.runtime.runFork(
				E.gen(this, function* () {
					const { mailbox } = yield* this.getHookOptions();

					/**
					 * NOTE: every command/query is executed in the "sequential"
					 * mode automatically.
					 * */
					const hookOptions: IPluginActivationHookData<ApiPlugin<Exposed>> = {
						ask: mailbox.sendQueryAsync.bind(mailbox),
						tell: mailbox.sendCommand.bind(mailbox),
						self: this,
					};

					const boundHooks = this.config.activationHooks.map((hook) => {
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
					return this.runtime.runFork(E.all(boundHooks));
				}),
			),
		);
	}

	runDeactivationHooks() {
		return Fiber.join(
			this.runtime.runFork(
				E.gen(this, function* () {
					const { mailbox } = yield* this.getHookOptions();

					const hookOptions: IPluginActivationHookData = {
						ask: mailbox.sendQueryAsync.bind(mailbox),
						tell: mailbox.sendCommand.bind(mailbox),
					};

					const boundHooks = this.config.deactivationHooks.map((hook) => {
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
					 * 1. IMPORTANT - make sure we use the plugin runtime here.
					 * See above.
					 * 2. We NEED to use Fiber.join() here, because otherwise effect will
					 * not wait for our hooks to run. This is important to make sure
					 * plugin shutdown is executed correctly.
					 * */
					yield* Fiber.join(this.runtime.runFork(E.all(boundHooks)));
				}),
			),
		);
	}
}
