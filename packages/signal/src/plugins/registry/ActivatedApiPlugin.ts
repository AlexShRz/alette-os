import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as FiberSet from "effect/FiberSet";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import { TaskScheduler } from "../../tasks/TaskScheduler";
import { ApiPlugin } from "../ApiPlugin.js";

export class ActivatedApiPlugin extends E.Service<ActivatedApiPlugin>()(
	"ActivatedApiPlugin",
	{
		effect: E.fn(function* (plugin: ApiPlugin) {
			let wasShutdown = false;
			const name = plugin.getName();
			const queuedPluginTasks = yield* plugin.getMailbox();
			const scope = yield* Scope.make();
			const supervisedTasks = yield* FiberSet.make().pipe(Scope.extend(scope));

			const taskScheduler = yield* TaskScheduler;

			yield* plugin.scheduleActivationHooks();

			const superviseFiber = (fiber: Fiber.RuntimeFiber<any>) => {
				return FiberSet.add(supervisedTasks, fiber);
			};

			/**
			 * Send tasks from plugin mailbox to main registry mailbox
			 * for execution.
			 * */
			yield* Stream.fromQueue(queuedPluginTasks).pipe(
				Stream.runForEach((task) =>
					E.gen(function* () {
						const runnable = yield* taskScheduler.scheduleLowPriority(
							task.build(),
						);

						/**
						 * Add task fiber for supervision automatically
						 * */
						yield* E.zipRight(
							runnable.waitForTrigger(),
							runnable.getFiberOrThrow(),
						).pipe(E.andThen(superviseFiber), E.forkIn(scope));

						return runnable;
					}),
				),
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

				supervise: superviseFiber,

				shutdown() {
					return E.gen(function* () {
						if (wasShutdown) {
							return;
						}

						wasShutdown = true;
						yield* Scope.close(scope, Exit.void);
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
