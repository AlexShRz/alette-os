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
					/**
					 * TODO: This is garbage, we need a proper
					 * task scheduling system. Create it later.
					 * */
					return E.gen(function* () {
						const result = yield* task;

						if (Fiber.isFiber(result) && Fiber.isRuntimeFiber(result)) {
							yield* E.addFinalizer(() => Fiber.interruptFork(result));
						}

						return result;
					}).pipe(E.provide(runtime), Scope.extend(scope));
				},
			};
		}),
	},
) {}
