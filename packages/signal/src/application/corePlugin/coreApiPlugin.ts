import { defineApiPlugin } from "../plugins";
import { customRequestFactory } from "./custom";
import { queryFactory } from "./query";

export const coreApiPlugin = () => {
	const { plugin, pluginRuntime } = defineApiPlugin("alette-signal/core");

	const query = queryFactory.executor(pluginRuntime).build();
	const custom = customRequestFactory.executor(pluginRuntime).build();

	return plugin
		.exposes(() => ({
			query: query.asFunction(),
			custom: custom.asFunction(),
		}))
		.build();
};
