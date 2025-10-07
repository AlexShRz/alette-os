import { CookieBuilder } from "../auth";
import { TokenBuilder } from "../auth/TokenBuilder";
import { defineApiPlugin } from "../plugins";
import { customRequestFactory } from "./custom";
import { mutationFactory } from "./mutation";
import { queryFactory } from "./query";

export const coreApiPlugin = () => {
	const { plugin } = defineApiPlugin("alette-signal/core");

	const core = plugin.build();

	return {
		plugin: core,
		use() {
			return {
				token: () => new TokenBuilder(core.getScheduler()),
				cookie: () => new CookieBuilder(core.getScheduler()),
				query: queryFactory.belongsTo(core).build().toFactory(),
				mutation: mutationFactory.belongsTo(core).build().toFactory(),
				custom: customRequestFactory.belongsTo(core).build().toFactory(),
			};
		},
	};
};
