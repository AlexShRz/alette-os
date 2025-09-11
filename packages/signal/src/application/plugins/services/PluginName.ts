import * as E from "effect/Effect";

export class PluginName extends E.Service<PluginName>()("PluginName", {
	accessors: true,
	effect: E.fn(function* (pluginName: string) {
		return {
			get() {
				return pluginName;
			},
		};
	}),
}) {}
