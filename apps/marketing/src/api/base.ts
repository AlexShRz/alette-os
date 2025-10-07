import {
	activatePlugins,
	client,
	coreApiPlugin,
	setOrigin,
} from "@alette/signal";

export const core = coreApiPlugin();

export const api = client(
	setOrigin("https://example.com"),
	activatePlugins(core.plugin),
);

export const { query, mutation, custom, token, cookie } = core.use();
