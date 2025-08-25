import * as E from "effect/Effect";
import * as Scope from "effect/Scope";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { ApiPlugin } from "../ApiPlugin.js";
import { ActivatedApiPlugin } from "./ActivatedApiPlugin.js";

export class PluginRegistry extends E.Service<PluginRegistry>()(
	"PluginRegistry",
	{
		scoped: E.gen(function* () {
			const scope = yield* E.scope;
			/**
			 * We need synchronization here, otherwise
			 * there will be dirty reads.
			 * */
			const plugins = yield* SynchronizedRef.make(
				new Map<string, ActivatedApiPlugin>(),
			);

			const getRegistry = () => SynchronizedRef.get(plugins);

			return {
				has(pluginName: string) {
					return E.runSync(
						E.gen(function* () {
							const registry = yield* getRegistry();
							return registry.has(pluginName);
						}),
					);
				},

				getActivatedPluginNames() {
					return E.runSync(
						E.gen(function* () {
							const registry = yield* getRegistry();
							return [...registry.keys()];
						}),
					);
				},

				get(pluginName: string) {
					return E.gen(function* () {
						const registry = yield* getRegistry();
						return registry.get(pluginName);
					});
				},

				getOrFail(pluginName: string) {
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

				activate(plugin: ApiPlugin) {
					return SynchronizedRef.getAndUpdateEffect(plugins, (registry) =>
						E.gen(function* () {
							const name = yield* plugin.getName();
							const activatedPlugin =
								yield* ActivatedApiPlugin.makeAsValue(plugin);
							registry.set(name, activatedPlugin);
							return registry;
						}).pipe(Scope.extend(scope)),
					);
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
