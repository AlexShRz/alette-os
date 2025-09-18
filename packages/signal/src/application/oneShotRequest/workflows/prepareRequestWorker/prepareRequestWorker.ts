import { EventBus } from "@alette/event-sourcing";
import { ExecutionStrategy } from "effect";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Scope from "effect/Scope";
import { v4 as uuid } from "uuid";
import { PluginRegistry } from "../../../plugins/services/PluginRegistry";
import { PrepareRequestWorkerArguments } from "./PrepareRequestWorkerArguments";
import { attachRequestWatcherPipeline } from "./attachWatcherPipeline";
import { createOrGetRequestThread } from "./createOrGetRequestThread";
import { createOrGetRequestWorker } from "./createRequestWorker";
import { setUpInterruptionRecovery } from "./setUpInterruptionRecovery";

/**
 * This effect is executed using another runtime with
 * different services, so we cannot access services of the
 * plugin that bootstraps the workflow.
 * */
const runWorkflow = E.gen(function* () {
	const { plugin: pluginFacade, middlewareInjectors } =
		yield* PrepareRequestWorkerArguments;
	const pluginRegistry = yield* E.serviceOptional(PluginRegistry);
	const plugin = yield* pluginRegistry.getPluginOrThrow(pluginFacade.getName());

	/**
	 * 1. Tie request scope to plugin scope using scope.fork.
	 * 2. This makes sure controllers are deactivated the
	 * moment our plugin is.
	 * */
	const requestScope = yield* Scope.fork(
		plugin.getScope(),
		ExecutionStrategy.sequential,
	);

	return yield* E.gen(function* () {
		const thread = yield* createOrGetRequestThread;
		const worker = yield* createOrGetRequestWorker(thread);
		yield* attachRequestWatcherPipeline(worker);
		yield* setUpInterruptionRecovery;
		return {
			worker,
			shutdown: () => Scope.close(requestScope, Exit.void),
		};
	}).pipe(
		E.provide(EventBus.Default(middlewareInjectors)),
		Scope.extend(requestScope),
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
