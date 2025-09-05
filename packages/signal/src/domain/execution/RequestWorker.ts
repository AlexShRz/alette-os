import { BusEvent, EventBus } from "@alette/event-sourcing";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Scope from "effect/Scope";
import { RequestMiddleware } from "../middleware/RequestMiddleware";
import { RequestEventInterceptor } from "./services/RequestEventInterceptor";
import { RequestSession } from "./services/RequestSession";
import { RequestStateTimeline } from "./services/RequestStateTimeline";
import { WatcherOrchestrator } from "./services/WatcherOrchestrator";
import { WatcherPipeline } from "./services/WatcherPipeline";

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
		const context = yield* E.context<never>();
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
		const requestStateTimeline = RequestStateTimeline.Default.pipe(
			Layer.provide(session),
		);
		const requestEventInterceptor = RequestEventInterceptor.Default.pipe(
			Layer.provide(session),
		);
		const requestEventBus = EventBus.Default(middleware).pipe(
			Layer.provide(requestEventInterceptor),
		);

		const requestRuntime = ManagedRuntime.make(
			Layer.mergeAll(
				Layer.succeedContext(context),
				session,
				requestStateTimeline,
				requestEventBus,
				WatcherOrchestrator.Default.pipe(
					Layer.provide(Layer.mergeAll(session, requestEventInterceptor)),
				),
			),
		);

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

			dispatch(event: BusEvent) {
				return requestRuntime.runFork(
					E.gen(function* () {
						const eventBus = yield* EventBus;
						yield* eventBus.send(event);
					}),
				);
			},

			addWatchers(watcherPipeline: Layer.Layer<WatcherPipeline>) {
				return requestRuntime.runFork(
					E.gen(function* () {
						const registry = yield* WatcherOrchestrator;
						// yield* eventBus.send(event);
					}),
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
