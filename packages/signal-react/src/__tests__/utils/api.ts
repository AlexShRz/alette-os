import {
	activatePlugins,
	client,
	coreApiPlugin,
	makeUrl,
	setOrigin,
} from "@alette/signal";

export const testUrl = makeUrl("https://example.com");

export const core = coreApiPlugin();

export const api = client(
	setOrigin(testUrl.getOrigin()),
	activatePlugins(core.plugin),
);

export const { custom, query } = core.use();
