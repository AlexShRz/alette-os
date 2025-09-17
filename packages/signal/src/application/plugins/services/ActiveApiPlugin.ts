import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Scope from "effect/Scope";
import { RequestThreadRegistry } from "../../../domain/execution/RequestThreadRegistry";
import { ApiPluginInfo } from "./activation/ApiPluginInfo";
import { ApiPluginLifecycleHooks } from "./activation/ApiPluginLifecycleHooks";

/**
 * 1. All plugin blueprint requests pass through here and then
 * back to Kernel for execution.
 * 2. The service manages request thread/worker lifecycle. The
 * moment our plugin is deactivated, all requests tied to it are interrupted and
 * workers/threads are cleaned.
 * */
export class ActiveApiPlugin extends E.Service<ActiveApiPlugin>()(
	"ActiveApiPlugin",
	{
		dependencies: [RequestThreadRegistry.Default],
		scoped: E.gen(function* () {
			const scope = yield* E.scope;
			const pluginInfo = yield* ApiPluginInfo;
			const hooks = yield* ApiPluginLifecycleHooks;
			const threads = yield* RequestThreadRegistry;
			const runtime = yield* E.runtime();

			yield* hooks.runActivationHooks();
			yield* E.addFinalizer(() => hooks.runDeactivationHooks());

			return {
				getName() {
					return pluginInfo.pluginName;
				},

				getThreads() {
					return threads;
				},

				getScope() {
					return scope;
				},

				/**
				 * IMPORTANT
				 * 1. Make sure scheduled tasks NEVER use forkScoped,
				 * otherwise they will never complete
				 * */
				runWithSupervision<A, E, R>(task: E.Effect<A, E, R>) {
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
