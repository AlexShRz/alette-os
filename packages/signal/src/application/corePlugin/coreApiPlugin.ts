import { defineApiPlugin } from "../plugins";
import { customRequestFactory } from "./custom";
import { queryFactory } from "./query";

export const coreApiPlugin = () => {
	const { plugin, pluginRuntime } = defineApiPlugin("alette-signal/core");

	return plugin
		.exposes(() => ({
			query: queryFactory.executor(pluginRuntime).build().asFunction(),
			custom: customRequestFactory.executor(pluginRuntime).build().asFunction(),
		}))
		.build();
};
