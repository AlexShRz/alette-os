import { EventBus } from "@alette/event-sourcing";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import { v4 as uuid } from "uuid";
import { RequestWorker } from "../../../../domain/execution/worker/RequestWorker";
import { PluginMailbox } from "../../../plugins/services/PluginMailbox";
import { PluginRegistry } from "../../../plugins/services/PluginRegistry";
import { queryTask } from "../../../plugins/tasks/primitive/functions";
import { PrepareRequestWorkerArguments } from "./PrepareRequestWorkerArguments";
import { attachRequestWatcherPipeline } from "./attachWatcherPipeline";
import { createOrGetRequestThread } from "./createOrGetRequestThread";
import { createOrGetRequestWorker } from "./createRequestWorker";

export class PrepareRequestWorker extends Context.Tag("PrepareRequestWorker")<
	PrepareRequestWorker,
	RequestWorker
>() {
	static send(args: Omit<PrepareRequestWorkerArguments["Type"], "workerId">) {
		return E.gen(function* () {
			const pluginMailbox = yield* PluginMailbox;
			const requestId = uuid();

			const workflow = PrepareRequestWorker.make().pipe(
				Layer.provide(
					PrepareRequestWorkerArguments.make({
						...args,
						workerId: requestId,
					}),
				),
			);

			return yield* pluginMailbox.sendQuery(
				queryTask(() =>
					E.gen(function* () {
						return yield* PrepareRequestWorker;
					}).pipe(E.provide(workflow)),
				).concurrent(),
			);
		});
	}

	private static make() {
		return Layer.effect(
			this,
			/**
			 * This effect is executed inside another runtime with
			 * different services, so we cannot access services of the
			 * plugin that bootstrapped the workflow.
			 * */
			E.gen(function* () {
				const {
					plugin: maybeInactivePlugin,
					middlewareInjectors,
					controller,
				} = yield* PrepareRequestWorkerArguments;
				const pluginRef = yield* maybeInactivePlugin.getOrCreatePluginRef();
				const pluginRegistry = yield* E.serviceOptional(PluginRegistry);
				const plugin = yield* pluginRegistry.getOrThrow(pluginRef.getName());

				/**
				 * 1. Tie controller scope to plugin scope.
				 * 2. This makes sure controllers are deactivated the
				 * moment our plugin is.
				 * */
				const controllerScope = controller.getScope();
				yield* Scope.addFinalizer(
					plugin.getScope(),
					Scope.close(controllerScope, Exit.void),
				);

				return yield* E.gen(function* () {
					const thread = yield* createOrGetRequestThread(plugin);
					const worker = yield* createOrGetRequestWorker(thread);
					yield* attachRequestWatcherPipeline(worker);
					return worker;
				}).pipe(
					E.provide(
						/**
						 * Make sure event bus with middleware and watcher
						 * injectors is created lazily, only if the service
						 * is required
						 * */
						EventBus.Default(middlewareInjectors),
					),
					/**
					 * 1. Make sure to apply CONTROLLER, not plugin scope here -
					 * the moment our controller is disposed, the scope
					 * should release ref counted resources (threads, workers, etc.)
					 * */
					Scope.extend(controller.getScope()),
					E.orDie,
				);
			}),
		);
	}
}
