import {
	activatePlugins,
	client,
	coreApiPlugin,
	makeUrl,
	setOrigin,
} from "@alette/signal";

export const testUrl = makeUrl("http://localhost:8080");

export const core = coreApiPlugin();

export const api = client(
	setOrigin(testUrl.getOrigin()),
	activatePlugins(core.plugin),
);

export const { token, custom, cookie, query } = core.use();
