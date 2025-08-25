import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as FiberSet from "effect/FiberSet";
import * as Layer from "effect/Layer";
import * as Mailbox from "effect/Mailbox";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import { KernelTaskRunnerAvailability } from "../../KernelTaskRunnerAvailability";
import { TaskBuilder } from "../../tasks/TaskBuilder.js";
import { ApiPlugin } from "../ApiPlugin.js";
import { IApiPluginMailboxMessage } from "../PluginMailbox";

export class ActivatedApiPlugin extends E.Service<ActivatedApiPlugin>()(
	"ActivatedApiPlugin",
	{
		scoped: E.fn(function* (plugin: ApiPlugin) {
			let wasShutdown = false;
			const name = yield* plugin.getName();
			const pluginTaskQueue = yield* plugin.getMailbox();
			const mailbox = yield* Mailbox.make<IApiPluginMailboxMessage>();

			const kernelAvailability = yield* E.serviceOptional(
				KernelTaskRunnerAvailability,
			);
			const scope = yield* Scope.make();
			const context = yield* E.context<never>();
			const runtime = ManagedRuntime.make(Layer.succeedContext(context));
			const supervisedTasks = yield* FiberSet.make().pipe(Scope.extend(scope));

			yield* plugin.runActivationHooks();

			yield* Scope.addFinalizer(
				scope,
				E.gen(function* () {
					yield* runtime.disposeEffect;
				}),
			);

			/**
			 * 1. Make sure to execute this effect inside
			 * our plugin runtime, not the "core" one.
			 * */
			const runPluginTask = <A, I>(task: TaskBuilder<A, I>) =>
				E.gen(function* () {
					if (wasShutdown) {
						return yield* E.dieMessage(
							"[ActivatedApiPlugin] - cannot execute plugin task. The plugin was shutdown.",
						);
					}

					const runnable = task.executor(runtime).build();
					runnable.spawn();
					const fiberFromRunnable = yield* E.zipRight(
						runnable.waitForTrigger(),
						runnable.getFiberOrThrow(),
					);
					FiberSet.add(supervisedTasks, fiberFromRunnable);

					if (runnable.isConcurrent()) {
						return;
					}

					return yield* runnable.waitForCompletion();
				}).pipe(runtime.runFork);

			yield* Stream.fromQueue(pluginTaskQueue).pipe(
				Stream.runForEach((task) => mailbox.offer(task)),
				E.forkIn(scope),
				Stream.runDrain,
			);
			yield* Mailbox.toStream(mailbox).pipe(
				Stream.runForEach((task) => Fiber.join(runPluginTask(task))),
				kernelAvailability.canProcessPluginTasks.whenOpen,
				E.forkIn(scope),
				Stream.runDrain,
			);

			return {
				isShutdown() {
					return wasShutdown;
				},

				getName() {
					return name;
				},

				shutdown() {
					return E.gen(function* () {
						if (wasShutdown) {
							return;
						}

						wasShutdown = true;
						yield* Scope.close(scope, Exit.void);
						// yield* plugin.runDeactivationHooks();
						// // yield* mailbox.end;
						// yield* E.sleep("5 seconds").pipe(
						// 	E.andThen(() => mailbox.end),
						// 	E.andThen(() => Scope.close(scope, Exit.void)),
						// );
					});
				},
			};
		}),
	},
) {
	static makeAsValue(plugin: ApiPlugin) {
		return Layer.build(ActivatedApiPlugin.Default(plugin)).pipe(
			E.andThen((c) => Context.unsafeGet(c, ActivatedApiPlugin)),
		);
	}
}
