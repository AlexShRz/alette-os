import * as E from "effect/Effect";
import * as Scope from "effect/Scope";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { RequestErrorProcessor } from "../../../domain/errors/services/RequestErrorProcessor";
import { TaskScheduler } from "../tasks/TaskScheduler";
import { ActiveApiPlugin } from "./ActiveApiPlugin";
import { ActivePluginRef } from "./ref/ActivePluginRef";

export class PluginRegistry extends E.Service<PluginRegistry>()(
	"PluginRegistry",
	{
		dependencies: [RequestErrorProcessor.Default],
		scoped: E.gen(function* () {
			const taskScheduler = yield* TaskScheduler;
			/**
			 * We need synchronization here, otherwise
			 * there will be dirty reads.
			 * */
			const plugins = yield* SynchronizedRef.make(
				new Map<string, ActiveApiPlugin>(),
			);

			const getRegistry = () => SynchronizedRef.get(plugins);

			return {
				has(pluginName: string) {
					return E.gen(function* () {
						const registry = yield* getRegistry();
						return registry.has(pluginName);
					});
				},

				getActivatedPluginNames() {
					return E.gen(function* () {
						const registry = yield* getRegistry();
						return [...registry.keys()];
					});
				},

				get(pluginName: string) {
					return E.gen(function* () {
						const registry = yield* getRegistry();
						return registry.get(pluginName);
					});
				},

				getAll() {
					return E.gen(function* () {
						const registry = yield* getRegistry();
						return [...registry.values()];
					});
				},

				getOrThrow(pluginName: string) {
					return E.gen(function* () {
						const registry = yield* getRegistry();
						const plugin = registry.get(pluginName);

						if (!plugin) {
							return yield* E.dieMessage(
								`[PluginRegistry] - Cannot find activated api plugin with name '${pluginName}'`,
							);
						}

						return plugin;
					});
				},

				activate(plugin: ActivePluginRef) {
					return E.gen(function* () {
						const scope = plugin.getScope();

						yield* SynchronizedRef.getAndUpdateEffect(plugins, (registry) =>
							E.gen(function* () {
								const name = plugin.getName();
								const activatedPlugin = yield* ActiveApiPlugin.makeAsValue(
									plugin,
								).pipe(E.provideService(TaskScheduler, taskScheduler));
								registry.set(name, activatedPlugin);
								return registry;
							}),
						).pipe(Scope.extend(scope));
					});
				},

				deactivate(name: string) {
					return SynchronizedRef.getAndUpdateEffect(plugins, (registry) =>
						E.gen(function* () {
							const activePlugin = registry.get(name);

							if (!activePlugin) {
								return registry;
							}

							yield* activePlugin.shutdown();
							registry.delete(name);
							return registry;
						}),
					);
				},
			};
		}),
	},
) {}
