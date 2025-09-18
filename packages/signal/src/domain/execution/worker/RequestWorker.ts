import { EventBus } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Scope from "effect/Scope";
import { GlobalContext } from "../../context/services/GlobalContext";
import { ErrorHandler } from "../../errors/ErrorHandler";
import { TSessionEvent } from "../events/SessionEvent";
import { RequestEventInterceptor } from "../services/RequestEventInterceptor";
import { RequestMeta } from "../services/RequestMeta";
import { RequestMetrics } from "../services/RequestMetrics";
import { RequestMode } from "../services/RequestMode";
import { RequestRunner } from "../services/RequestRunner";
import { RequestSession } from "../services/RequestSession";
import { RequestSessionContext } from "../services/RequestSessionContext";
import { RequestStateTimeline } from "../services/timeline/RequestStateTimeline";
import { WatcherPipeline } from "../services/watchers/WatcherPipeline";
import { WatcherPipelineConfig } from "../services/watchers/WatcherPipelineConfig";
import { WatcherPipelineRegistry } from "../services/watchers/WatcherPipelineRegistry";
import { sendSessionEvent } from "../utils/sendSessionEvent";
import { RequestWorkerConfig } from "./RequestWorkerConfig";

export class RequestWorker extends E.Service<RequestWorker>()("RequestWorker", {
	scoped: E.fn(function* (config: RequestWorkerConfig) {
		const scope = yield* E.scope;
		const context = yield* E.context<GlobalContext | ErrorHandler>();
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
		const session = RequestSession.Default(config.getId()).pipe(
			Layer.provide(RequestSessionContext.Default),
		);
		const common = Layer.mergeAll(
			RequestSessionContext.Default,
			RequestMetrics.Default,
			RequestMeta.Default,
			/**
			 * TODO: Switch runner based on request
			 * type (oneShot vs stream).
			 * */
			RequestRunner.make(),
			WatcherPipelineRegistry.Default,
			RequestMode.Default(config.getRequestMode()),
		);
		const timeline = Layer.provideMerge(
			/**
			 * TODO: Switch timeline based on request
			 * type (oneShot vs stream).
			 * */
			RequestStateTimeline.make(),
			EventBus.Default(config.getMiddleware()).pipe(
				Layer.provide(RequestEventInterceptor.Default),
			),
		);

		const container = Layer.provideMerge(
			Layer.provideMerge(common, Layer.provideMerge(timeline, session)),
			Layer.succeedContext(context),
		);
		const requestRuntime = ManagedRuntime.make(container);

		yield* E.addFinalizer(
			E.fn(function* () {
				yield* requestRuntime.disposeEffect;
			}),
		);

		return {
			isWatchedBy(controllerId: string) {
				return E.gen(function* () {
					const registry = yield* WatcherPipelineRegistry;
					return yield* registry.has(controllerId);
				}).pipe(E.provide(requestRuntime));
			},

			getId() {
				return config.getId();
			},

			dispatch<T extends TSessionEvent>(event: T) {
				return requestRuntime.runFork(sendSessionEvent(event));
			},

			addWatchers(config: WatcherPipelineConfig) {
				return E.gen(function* () {
					const registry = yield* WatcherPipelineRegistry;
					const runtime = yield* registry.getOrCreateWatcherRuntime(config);
					return yield* E.serviceOptional(WatcherPipeline).pipe(
						E.provide(runtime),
					);
				}).pipe(Scope.extend(scope), E.provide(requestRuntime));
			},
		};
	}),
}) {}
