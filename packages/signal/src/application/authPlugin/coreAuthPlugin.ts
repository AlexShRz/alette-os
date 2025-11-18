import { CookieBuilder, TokenBuilder } from "../auth";
import { defineApiPlugin } from "../plugins";

export const coreAuthPlugin = () => {
	const { plugin } = defineApiPlugin("alette-signal/core-auth");

	const auth = plugin.build();

	return {
		plugin: auth,
		use() {
			return {
				token: () => new TokenBuilder(auth.getScheduler()),
				cookie: () => new CookieBuilder(auth.getScheduler()),
			};
		},
	};
};
