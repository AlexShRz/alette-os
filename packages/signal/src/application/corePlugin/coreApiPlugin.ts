import { defineApiPlugin } from "../plugins";
import { customRequestFactory } from "./custom";
import { queryFactory } from "./query";

export const coreApiPlugin = () => {
	const { plugin } = defineApiPlugin("alette-signal/core");

	const core = plugin.build();

	return {
		plugin: core,
		use() {
			return {
				query: queryFactory.belongsTo(core).build().asFunction(),
				custom: customRequestFactory.belongsTo(core).build().asFunction(),
			};
		},
	};
};
