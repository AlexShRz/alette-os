import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import {
	IPluginActivationHook,
	IPluginDeactivationHook,
} from "../../ApiPluginBuilder";
import { IPluginRuntime } from "../../defineApiPlugin";
import { PluginMailbox } from "../PluginMailbox";
import { PluginName } from "../PluginName";
import { ActivePluginRef } from "./ActivePluginRef";

export class PluginLifecycle extends E.Service<PluginLifecycle>()(
	"PluginLifecycle",
	{
		accessors: true,
		dependencies: [PluginMailbox.Default],
		effect: E.gen(function* () {
			const pluginName = yield* PluginName.get();
			let pluginRef: ActivePluginRef | null = null;

			const runtime = ManagedRuntime.make(
				Layer.succeedContext(yield* E.context<PluginMailbox>()),
			);

			return {
				getOrCreatePluginRef({
					activationHooks,
					deactivationHooks,
				}: {
					activationHooks: IPluginActivationHook[];
					deactivationHooks: IPluginDeactivationHook[];
				}) {
					return E.gen(this, function* () {
						if (pluginRef && pluginRef.isAlive()) {
							return pluginRef;
						}

						const mailbox = yield* Fiber.join(
							runtime.runFork(
								E.gen(function* () {
									const mailbox = yield* PluginMailbox;
									return mailbox.get();
								}),
							),
						);

						const ref = new ActivePluginRef({
							pluginName,
							pluginMailbox: mailbox,
							runtime: runtime as IPluginRuntime,
							activationHooks: [...activationHooks],
							deactivationHooks: [...deactivationHooks],
						});
						pluginRef = ref;
						return ref;
					});
				},
			};
		}),
	},
) {}
