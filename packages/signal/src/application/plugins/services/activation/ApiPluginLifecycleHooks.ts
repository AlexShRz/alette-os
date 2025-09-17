import * as E from "effect/Effect";
import {
	IPluginActivationHook,
	IPluginActivationHookData,
	IPluginDeactivationHook,
} from "../../ApiPluginBuilder";
import { ApiPluginInfo } from "./ApiPluginInfo";

export class ApiPluginLifecycleHooks extends E.Service<ApiPluginLifecycleHooks>()(
	"ApiPluginLifecycleHooks",
	{
		accessors: true,
		effect: E.gen(function* () {
			const { deactivationHooks, activationHooks, scheduler } =
				yield* ApiPluginInfo;

			const createHookExecutor = (
				hooks: IPluginDeactivationHook[] | IPluginActivationHook[],
			) => {
				return E.gen(function* () {
					const hookOptions: IPluginActivationHookData = {
						ask: (task) => {
							return new Promise((resolve, reject) => {
								const configuredTask = task.build().pipe(
									E.andThen((result) => resolve(result)),
									E.catchAll((error) => E.sync(() => reject(error))),
								);

								scheduler.schedule(configuredTask);
							});
						},
						tell: (task) => {
							scheduler.schedule(task.build());
						},
					};

					const boundHooks = hooks.map((hook) => {
						const executeHook = async () => await hook(hookOptions);
						return E.promise(() => executeHook());
					});

					/**
					 * Make sure to use forkDaemon here:
					 * 1. If we use fork or forkScoped it seems like plugin scope
					 * is closed FASTER than our hooks are able to run. For example,
					 * the first hook might run, but will might be skipped.
					 * 2. DO NOT execute hooks without forking them. Otherwise, if
					 * some of them contain "ask" everything will become stuck.
					 * */
					yield* E.all(boundHooks).pipe(E.forkDaemon);
				});
			};

			return {
				runActivationHooks() {
					return createHookExecutor(activationHooks);
				},

				runDeactivationHooks() {
					return createHookExecutor(deactivationHooks);
				},
			};
		}),
	},
) {}
