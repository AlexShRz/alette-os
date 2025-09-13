import { EventBus } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as Scope from "effect/Scope";
import { v4 as uuid } from "uuid";
import { PluginMailbox } from "../../../plugins/services/PluginMailbox";
import { PluginRegistry } from "../../../plugins/services/PluginRegistry";
import { queryTask } from "../../../plugins/tasks/primitive/functions";
import { PrepareRequestWorkerArguments } from "./PrepareRequestWorkerArguments";
import { attachRequestWatcherPipeline } from "./attachWatcherPipeline";
import { createOrGetRequestThread } from "./createOrGetRequestThread";
import { createOrGetRequestWorker } from "./createRequestWorker";

/**
 * This effect is executed inside another runtime with
 * different services, so we cannot access services of the
 * plugin that bootstraps the workflow.
 * */
const runWorkflow = E.gen(function* () {
	const {
		plugin: maybeInactivePlugin,
		middlewareInjectors,
		controller,
	} = yield* PrepareRequestWorkerArguments;
	const pluginRef = yield* maybeInactivePlugin.getOrCreatePluginRef();
	const pluginRegistry = yield* E.serviceOptional(PluginRegistry);
	const plugin = yield* pluginRegistry.getOrThrow(pluginRef.getName());

	/**
	 * TODO: Fix this.
	 * 1. Right now Scope.close(controllerScope, Exit.void); becomes
	 * stuck and does not finish.
	 * 2. If you close controllerScope somewhere else it works.
	 * 3. Maybe we need to do Scope.fork() from ActivePluginRef? But that would
	 * require a pretty big rewrite. We would have to move RequestController, etc.,
	 * to services, I don't have time to do that now.
	 * */
	// const pluginScope = yield* plugin.getScope();
	// /**
	//  * 1. Tie controller scope to plugin scope.
	//  * 2. This makes sure controllers are deactivated the
	//  * moment our plugin is.
	//  * */
	// const controllerScope = controller.getScope();
	// yield* Scope.addFinalizer(
	// 	pluginScope,
	// 	E.gen(function* () {
	// 		console.log("adasd");
	// 		yield* Scope.close(controllerScope, Exit.void);
	// 		console.log("sdsdsd");
	// 	}),
	// );

	return yield* E.gen(function* () {
		const thread = yield* createOrGetRequestThread(plugin);
		const worker = yield* createOrGetRequestWorker(thread);
		yield* attachRequestWatcherPipeline(worker);
		return worker;
	}).pipe(
		E.provide(EventBus.Default(middlewareInjectors)),
		/**
		 * 1. Make sure to apply CONTROLLER, not plugin scope here -
		 * the moment our controller is disposed, the scope
		 * should release ref counted resources (threads, workers, etc.)
		 * */
		Scope.extend(controller.getScope()),
		E.orDie,
	);
});

export const prepareRequestWorker = E.fn(function* (
	args: Omit<PrepareRequestWorkerArguments["Type"], "workerId">,
) {
	const pluginMailbox = yield* PluginMailbox;
	const requestId = uuid();

	return yield* pluginMailbox.sendQuery(
		queryTask(() =>
			runWorkflow.pipe(
				E.provide(
					PrepareRequestWorkerArguments.make({
						...args,
						workerId: requestId,
					}),
				),
			),
		).concurrent(),
	);
});
