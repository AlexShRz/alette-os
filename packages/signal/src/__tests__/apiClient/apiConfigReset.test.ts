import { expect } from "@effect/vitest";
import {
	activatePlugins,
	defineApiPlugin,
	forActivePlugins,
} from "../../application";
import { client } from "../../infrastructure/ApiClient.js";

test("it executes memoized config during reset", async () => {
	const { plugin: plugin1, pluginName: pluginName1 } =
		defineApiPlugin("plugin1");
	const { plugin: plugin2, pluginName: pluginName2 } =
		defineApiPlugin("plugin2");

	const api = client(activatePlugins(plugin1.build(), plugin2.build()));
	const activePlugins = await api.ask(forActivePlugins());

	expect(activePlugins).toEqual([pluginName1, pluginName2]);

	setTimeout(() => {
		api.reset();
	}, 100);

	const activePlugins2 = await api.ask(forActivePlugins());
	expect(activePlugins2).toEqual([pluginName1, pluginName2]);
});
