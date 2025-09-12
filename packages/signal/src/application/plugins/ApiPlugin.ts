import * as E from "effect/Effect";
import {
	IPluginActivationHook,
	IPluginDeactivationHook,
} from "./ApiPluginBuilder.js";
import { IPluginRuntime } from "./defineApiPlugin.js";
import { PluginLifecycle } from "./services/ref/PluginLifecycle";

export class ApiPlugin {
	protected runtime: IPluginRuntime;

	constructor(
		protected config: {
			name: string;
			runtime: IPluginRuntime;
			activationHooks: IPluginDeactivationHook[];
			deactivationHooks: IPluginActivationHook[];
		},
	) {
		this.runtime = this.config.runtime;
	}

	/** @internal  */
	getOrCreatePluginRef() {
		return E.gen(this, function* () {
			const ref = yield* PluginLifecycle;
			return yield* ref.getOrCreatePluginRef({
				deactivationHooks: this.config.deactivationHooks,
				activationHooks: this.config.activationHooks,
			});
		}).pipe(E.provide(this.config.runtime));
	}

	getName() {
		return this.config.name;
	}

	/** @internal  */
	getRuntime() {
		return this.runtime;
	}
}
