import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { RequestStateTimeline } from "../RequestStateTimeline";
import { WatcherPipeline } from "./WatcherPipeline";

/**
 * Used for avoiding circular reference issues
 * */
type UnknownPipeline = {
	shutdown(): E.Effect<void>;
	send: (e: unknown) => E.Effect<void>;
};

type Pipelines = Record<string, WatcherPipeline>;

export class WatcherOrchestrator extends E.Service<WatcherOrchestrator>()(
	"WatcherOrchestrator",
	{
		scoped: E.gen(function* () {
			const scope = yield* Scope.make();
			const pipelines = yield* SynchronizedRef.make<Pipelines>({});
			const timeline = yield* RequestStateTimeline;

			yield* E.addFinalizer(
				E.fn(function* () {
					yield* Scope.close(scope, Exit.void);
					yield* pipelines.get.pipe(
						E.andThen(
							E.fn(function* (registry) {
								const tasks = Object.entries(registry).map(([_, pipeline]) =>
									(pipeline as UnknownPipeline).shutdown(),
								);
								yield* E.all(tasks, {
									discard: true,
									concurrency: "unbounded",
								});
							}),
						),
					);
				}),
			);

			yield* timeline.broadcast().pipe(
				/**
				 * When a new events is received,
				 * broadcast it to every watcher pipeline
				 * */
				Stream.runForEach((event) =>
					SynchronizedRef.getAndUpdateEffect(
						pipelines,
						E.fn(function* (registry) {
							const tasks = Object.entries(registry).map(([_, pipeline]) =>
								(pipeline as UnknownPipeline).send(event),
							);
							yield* E.all(tasks, { discard: true, concurrency: "unbounded" });
							return registry;
						}),
					),
				),
				Stream.runDrain,
				E.forkScoped,
			);

			return {
				has(pipelineId: string) {
					return pipelines.get.pipe(E.andThen((p) => !!p[pipelineId]));
				},

				set(pipelineId: string, pipeline: Layer.Layer<WatcherPipeline>) {
					return SynchronizedRef.getAndUpdateEffect(pipelines, (registry) =>
						E.gen(function* () {
							const currentPipeline = registry[pipelineId];

							if (currentPipeline) {
								return registry;
							}

							const watcher = yield* WatcherPipeline.makeAsValue(pipeline);
							registry[pipelineId] = watcher;
							/**
							 * Start replaying events in the
							 * background
							 * */
							yield* timeline
								.replay((e) => watcher.send(e))
								.pipe(E.forkIn(scope));
							return registry;
						}).pipe(Scope.extend(scope)),
					);
				},

				remove(pipelineId: string) {
					return SynchronizedRef.getAndUpdateEffect(
						pipelines,
						E.fn(function* (registry) {
							/**
							 * Do not shut down the pipeline,
							 * the pipeline will do that automatically
							 * */
							delete registry[pipelineId];
							return registry;
						}),
					);
				},
			};
		}),
	},
) {}
