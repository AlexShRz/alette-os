import { EventBus } from "@alette/event-sourcing";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import { v4 as uuid } from "uuid";
import { RequestWorker } from "../../../../domain/execution/worker/RequestWorker";
import { PluginMailbox } from "../../../plugins/services/PluginMailbox";
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
			E.gen(function* () {
				const args = yield* PrepareRequestWorkerArguments;

				return yield* E.gen(function* () {
					const thread = yield* createOrGetRequestThread;
					const worker = yield* createOrGetRequestWorker(thread);
					yield* attachRequestWatcherPipeline(worker);
					return worker;
				}).pipe(
					E.provide(
						Layer.mergeAll(
							/**
							 * Make sure event bus with middleware and watcher
							 * injectors is created lazily, only if the service
							 * is required
							 * */
							EventBus.Default(args.middlewareInjectors),
						),
					),
					/**
					 * 1. Make sure to apply CONTROLLER scope here -
					 * the moment our controller is disposed, the scope
					 * should release ref counted resources (threads, workers, etc.)
					 * */
					Scope.extend(args.controller.getScope()),
					E.orDie,
				);
			}),
		);
	}
}
