import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Scope from "effect/Scope";
import { RequestThreadRegistry } from "../../../domain/execution/RequestThreadRegistry";
import { ApiPluginInfo } from "./activation/ApiPluginInfo";
import { ApiPluginLifecycleHooks } from "./activation/ApiPluginLifecycleHooks";

export class ActiveApiPlugin extends E.Service<ActiveApiPlugin>()(
	"ActiveApiPlugin",
	{
		dependencies: [RequestThreadRegistry.Default],
		scoped: E.gen(function* () {
			const scope = yield* E.scope;

			const threads = yield* RequestThreadRegistry;
			const pluginInfo = yield* ApiPluginInfo;
			const hooks = yield* ApiPluginLifecycleHooks;
			const runtime = yield* E.runtime();

			yield* hooks.runActivationHooks();
			yield* E.addFinalizer(() => hooks.runDeactivationHooks());

			return {
				getName() {
					return pluginInfo.pluginName;
				},

				getScope() {
					return scope;
				},

				getThreads() {
					return threads;
				},

				/**
				 * IMPORTANT
				 * 1. Make sure scheduled tasks NEVER use forkScoped,
				 * otherwise they will never complete.
				 * 2. Do not use FiberSet here, it's api is pretty inflexible
				 * and creates more problems than it solves for this specific use case.
				 * */
				runWithSupervision<A, E, R>(task: E.Effect<A, E, R>) {
					return E.gen(function* () {
						/**
						 * 1. This wrapper allows us to catch
						 * forked tasks and interrupt them when
						 * our scope is closed.
						 * 2. This also makes sure that we can run tasks
						 * concurrently with supervision.
						 * */
						const fiber = yield* E.gen(function* () {
							const fiberOrResult = yield* task;

							if (
								Fiber.isFiber(fiberOrResult) &&
								Fiber.isRuntimeFiber(fiberOrResult)
							) {
								return yield* Fiber.join(fiberOrResult);
							}

							return fiberOrResult;
						}).pipe(E.fork);

						yield* E.addFinalizer(() => Fiber.interruptFork(fiber));
					}).pipe(E.provide(runtime), Scope.extend(scope));
				},
			};
		}),
	},
) {}
