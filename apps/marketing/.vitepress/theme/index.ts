import type { EnhanceAppContext } from "vitepress";
import Theme from "vitepress/theme";
import { h } from "vue";
import Banner from "./components/Banner.vue";
import Sponsors from "./components/Sponsors.vue";

import "./custom.css";
import "virtual:group-icons.css";

export default {
	extends: Theme,
	enhanceApp({ app }: EnhanceAppContext) {},
	Layout() {
		return h(Theme.Layout, null, {
			"aside-outline-after": () => h(Sponsors),
			// "layout-top": () => h(Banner),
		});
	},
};
