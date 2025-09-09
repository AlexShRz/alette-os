import { EventBus } from "@alette/event-sourcing";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Scope from "effect/Scope";
import { GlobalContext } from "../context/services/GlobalContext";
import { RequestMiddleware } from "../middleware/RequestMiddleware";
import { RequestMetrics } from "./RequestMetrics";
import { TSessionEvent } from "./events/SessionEvent";
import { RequestEventInterceptor } from "./services/RequestEventInterceptor";
import { RequestMeta } from "./services/RequestMeta";
import { RequestSession } from "./services/RequestSession";
import { RequestSessionContext } from "./services/RequestSessionContext";
import { RequestStateTimeline } from "./services/timeline/RequestStateTimeline";
import { WatcherOrchestrator } from "./services/watchers/WatcherOrchestrator";
import { WatcherPipeline } from "./services/watchers/WatcherPipeline";
import { sendSessionEvent } from "./utils/sendSessionEvent";

// TODO: Add stream mode
export type TRequestMode = "oneShot" | "subscription";

export class RequestWorker extends E.Service<RequestWorker>()("RequestWorker", {
	effect: E.fn(function* ({
		id,
		requestMode,
		middleware,
	}: {
		id: string;
		requestMode: TRequestMode;
		middleware: RequestMiddleware[];
	}) {
		const scope = yield* Scope.make();
		const context = yield* E.context<GlobalContext>();
		const session = RequestSession.Default({
			/**
			 * 1. Because workers are usually created once
			 * for every dispatched request, we can safely
			 * use their id as initialRequestId. Workers CAN
			 * be reused only if request state sharing is turned on.
			 * 2. The request id can be is changed ONLY if we
			 * are in the "subscription" mode. For example,
			 * it is changed when we refetch the request using
			 * the same subscription, etc.
			 * */
			initialRequestId: id,
			requestMode: requestMode,
		});
		const requestEventBus = EventBus.Default(middleware).pipe(
			Layer.provide(RequestEventInterceptor.Default),
		);

		const container = Layer.provideMerge(
			Layer.provideMerge(
				Layer.mergeAll(
					RequestSessionContext.Default,
					RequestMetrics.Default,
					RequestMeta.Default,
					requestEventBus,
					WatcherOrchestrator.Default,
				),
				Layer.provideMerge(
					Layer.provideMerge(
						/**
						 * TODO: Switch timeline based on request
						 * type (oneShot vs stream).
						 * */
						RequestStateTimeline.make(),
						requestEventBus,
					),
					session,
				),
			),
			Layer.succeedContext(context),
		);

		const requestRuntime = ManagedRuntime.make(container);

		return {
			isWatchedBy(controllerId: string) {
				return Fiber.join(
					requestRuntime.runFork(
						E.gen(function* () {
							const registry = yield* WatcherOrchestrator;
							return yield* registry.has(controllerId);
						}),
					),
				);
			},

			getId() {
				return id;
			},

			dispatch<T extends TSessionEvent>(event: T) {
				return requestRuntime.runFork(sendSessionEvent(event));
			},

			addWatchers(
				pipelineId: string,
				watcherPipeline: Layer.Layer<WatcherPipeline>,
			) {
				return Fiber.join(
					requestRuntime.runFork(
						E.gen(function* () {
							const registry = yield* WatcherOrchestrator;
							yield* registry.set(pipelineId, watcherPipeline);
						}),
					),
				);
			},

			shutdown() {
				return E.gen(function* () {
					yield* Scope.close(scope, Exit.void);
				});
			},
		};
	}),
}) {
	static makeAsValue(worker: Layer.Layer<RequestWorker>) {
		return Layer.build(worker).pipe(
			E.andThen((c) => Context.unsafeGet(c, RequestWorker)),
		);
	}
}
