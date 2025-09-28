import * as E from "effect/Effect";
import * as Equal from "effect/Equal";
import * as Hash from "effect/Hash";
import * as Layer from "effect/Layer";
import { v4 as uuid } from "uuid";
import {
	IPluginActivationHook,
	IPluginDeactivationHook,
} from "../../ApiPluginBuilder";
import { PluginTaskScheduler } from "../../PluginTaskScheduler";
import { ApiPluginInfo } from "./ApiPluginInfo";
import { ApiPluginLifecycleHooks } from "./ApiPluginLifecycleHooks";

export class ApiPluginServices implements Equal.Equal {
	protected id = uuid();

	constructor(
		protected config: {
			pluginName: string;
			scheduler: PluginTaskScheduler;
			activationHooks: IPluginDeactivationHook[];
			deactivationHooks: IPluginActivationHook[];
		},
	) {}

	getId() {
		return this.id;
	}

	getPluginName() {
		return this.config.pluginName;
	}

	getScheduler() {
		return this.config.scheduler;
	}

	toLayer() {
		return Layer.provideMerge(
			ApiPluginLifecycleHooks.Default,
			Layer.effect(
				ApiPluginInfo,
				E.succeed(
					ApiPluginInfo.of({
						pluginName: this.getPluginName(),
						scheduler: this.getScheduler(),
						activationHooks: this.config.activationHooks,
						deactivationHooks: this.config.deactivationHooks,
					}),
				),
			),
		);
	}

	[Equal.symbol](that: Equal.Equal): boolean {
		if (that instanceof ApiPluginServices) {
			return this.config.pluginName === that.getPluginName();
		}

		return false;
	}

	[Hash.symbol](): number {
		return Hash.hash(this.config.pluginName);
	}
}
