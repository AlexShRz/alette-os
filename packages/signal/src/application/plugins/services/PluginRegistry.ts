import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LayerMap from "effect/LayerMap";
import * as RcMap from "effect/RcMap";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { GlobalContext } from "../../../domain/context/services/GlobalContext";
import { RequestErrorProcessor } from "../../../domain/errors/RequestErrorProcessor";
import { ActiveApiPlugin } from "./ActiveApiPlugin";
import { ApiPluginServices } from "./activation/ApiPluginServices";

export class PluginRegistry extends E.Service<PluginRegistry>()(
	"PluginRegistry",
	{
		dependencies: [RequestErrorProcessor.Default],
		scoped: E.gen(function* () {
			const context = yield* E.context<GlobalContext>();

			/**
			 * 1. idleTimeToLive must be Infinity - plugins can
			 * be removed only manually, we do not care about scopes here.
			 * 2. When we are getting a plugin from the list, we should use
			 * a transient scope - "E.scoped" that's closed immediately.
			 * 3. Because idleTimeToLive is Infinity, the activate plugin won't
			 * be removed until we call ".invalidate()"
			 * */
			const plugins = yield* SynchronizedRef.make(
				yield* LayerMap.make(
					(services: ApiPluginServices) =>
						ActiveApiPlugin.Default.pipe(
							Layer.provide(
								Layer.mergeAll(
									services.toLayer(),
									Layer.succeedContext(context),
								),
							),
						),
					{ idleTimeToLive: Infinity },
				),
			);

			const findPluginServices = (pluginName: string) =>
				E.gen(function* () {
					const registry = yield* plugins.get;
					const services = yield* RcMap.keys(registry.rcMap);
					return services.find((s) => s.getPluginName() === pluginName);
				});

			return {
				has(pluginName: string) {
					return E.gen(function* () {
						const services = yield* findPluginServices(pluginName);
						return !!services;
					});
				},

				getActivatedPluginNames() {
					return E.gen(function* () {
						const registry = yield* plugins.get;
						const services = yield* RcMap.keys(registry.rcMap);
						return services.map((s) => s.getPluginName());
					});
				},

				getPluginOrThrow(pluginName: string) {
					return E.gen(this, function* () {
						const services = yield* findPluginServices(pluginName);

						if (!services) {
							return yield* new Cause.NoSuchElementException(
								`Cannot find plugin with name - "${pluginName}"`,
							);
						}

						const registry = yield* plugins.get;

						return yield* E.serviceOptional(ActiveApiPlugin).pipe(
							E.provide(registry.get(services)),
						);
					});
				},

				getOrCreatePlugin(services: ApiPluginServices) {
					return E.gen(function* () {
						const registry = yield* plugins.get;
						const runtime = yield* registry.runtime(services);
						return Context.unsafeGet(runtime.context, ActiveApiPlugin);
					}).pipe(E.scoped);
				},

				getAll() {
					return E.gen(this, function* () {
						const registry = yield* plugins.get;
						const pluginServices = yield* RcMap.keys(registry.rcMap);
						const collected: ActiveApiPlugin[] = [];

						for (const services of pluginServices) {
							const plugin = yield* this.getOrCreatePlugin(services);
							collected.push(plugin);
						}

						return collected;
					}).pipe(E.orDie);
				},

				activate(services: ApiPluginServices) {
					return SynchronizedRef.getAndUpdateEffect(plugins, (registry) =>
						E.gen(this, function* () {
							const scheduler = services.getScheduler();
							const plugin = yield* this.getOrCreatePlugin(services);
							yield* scheduler.setActivePlugin(plugin);
							return registry;
						}),
					);
				},

				deactivate(pluginName: string) {
					return SynchronizedRef.getAndUpdateEffect(plugins, (registry) =>
						E.gen(this, function* () {
							const services = yield* RcMap.keys(registry.rcMap);
							const pluginServices = services.find(
								(s) => s.getPluginName() === pluginName,
							);

							if (pluginServices) {
								yield* registry.invalidate(pluginServices);
							}

							return registry;
						}),
					);
				},
			};
		}),
	},
) {}
