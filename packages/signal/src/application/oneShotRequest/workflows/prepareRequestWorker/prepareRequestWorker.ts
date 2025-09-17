import { EventBus } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Scope from "effect/Scope";
import { v4 as uuid } from "uuid";
import { PluginRegistry } from "../../../plugins/services/PluginRegistry";
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
		getController,
		plugin: pluginFacade,
		middlewareInjectors,
	} = yield* PrepareRequestWorkerArguments;
	const pluginRegistry = yield* E.serviceOptional(PluginRegistry);
	const plugin = yield* pluginRegistry.getPluginOrThrow(pluginFacade.getName());

	const controllerScope = getController().getScope();
	const pluginScope = plugin.getScope();

	/**
	 * TODO: Fix this.
	 * 1. Right now Scope.close(controllerScope, Exit.void); becomes
	 * stuck and does not finish.
	 * 2. If you close controllerScope somewhere else it works.
	 * 3. Maybe we need to do Scope.fork() from ActivePluginRef? But that would
	 * require a pretty big rewrite. We would have to move RequestController, etc.,
	 * to services, I don't have time to do that now.
	 * */
	/**
	 * 1. Tie controller scope to plugin scope.
	 * 2. This makes sure controllers are deactivated the
	 * moment our plugin is.
	 * */
	yield* Scope.addFinalizer(
		pluginScope,
		E.gen(function* () {
			yield* Scope.close(controllerScope, Exit.void);
		}),
	);

	return yield* E.gen(function* () {
		const thread = yield* createOrGetRequestThread(plugin);
		const worker = yield* createOrGetRequestWorker(thread);
		yield* attachRequestWatcherPipeline(worker);
		return {
			worker,
			shutdown: () => E.void,
		};
	}).pipe(
		E.provide(EventBus.Default(middlewareInjectors)),
		Scope.extend(controllerScope),
		E.orDie,
	);
});

export const prepareRequestWorker = E.fn(function* (
	args: Omit<PrepareRequestWorkerArguments["Type"], "workerId">,
) {
	const requestId = uuid();
	return yield* runWorkflow.pipe(
		E.provide(
			PrepareRequestWorkerArguments.make({
				...args,
				workerId: requestId,
			}),
		),
	);
});
