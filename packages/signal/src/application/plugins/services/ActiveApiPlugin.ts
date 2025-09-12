import { ExecutionStrategy } from "effect";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as FiberSet from "effect/FiberSet";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import { RequestThreadRegistry } from "../../../domain/execution/RequestThreadRegistry";
import { TaskScheduler } from "../tasks/TaskScheduler";
import { ActivePluginRef } from "./ref/ActivePluginRef";

/**
 * 1. All plugin blueprint requests pass through here and then
 * back to Kernel for execution.
 * 2. The service manages request thread/worker lifecycle. The
 * moment our plugin is deactivated, all requests tied to it are interrupted and
 * workers/threads are cleaned.
 * */
export class ActiveApiPlugin extends E.Service<ActiveApiPlugin>()(
	"ActiveApiPlugin",
	{
		effect: E.fn(function* (pluginReference: ActivePluginRef) {
			const taskScheduler = yield* TaskScheduler;
			const threads = yield* RequestThreadRegistry;
			const pluginScope = pluginReference.getScope();

			/**
			 * Set up our reference to activate
			 * plugin hooks
			 * */
			yield* pluginReference.activate();

			const name = pluginReference.getName();
			const queuedPluginTasks = pluginReference.getMailbox();
			const supervisedTasks = yield* FiberSet.make().pipe(
				Scope.extend(pluginScope),
			);

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
						).pipe(E.andThen(superviseFiber), E.forkIn(pluginScope));

						return runnable;
					}),
				),
				E.forkIn(pluginScope),
				Stream.runDrain,
			);

			return {
				getName() {
					return name;
				},

				getThreads() {
					return threads;
				},

				getScope() {
					return Scope.fork(pluginScope, ExecutionStrategy.sequential);
				},

				shutdown() {
					return pluginReference.invalidate();
				},
			};
		}),
	},
) {
	static makeAsValue(plugin: ActivePluginRef) {
		return Layer.build(ActiveApiPlugin.Default(plugin)).pipe(
			E.andThen((c) => Context.unsafeGet(c, ActiveApiPlugin)),
		);
	}
}
