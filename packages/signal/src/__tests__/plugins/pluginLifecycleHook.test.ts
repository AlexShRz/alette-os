import { expect } from "@effect/vitest";
import * as E from "effect/Effect";
import {
	activatePlugins,
	deactivatePlugins,
	defineApiPlugin,
	forActivePlugins,
} from "../../application";
import { task } from "../../application/plugins/tasks/primitive/functions";
import { client } from "../../infrastructure/ApiClient.js";

test("it runs activation hooks on mount", async () => {
	const api = client();
	const { plugin, pluginName: corePluginName } = defineApiPlugin("hello");
	// const { plugin: plugin2 } = defineApiPlugin("otherPlugin");
	const logged: number[] = [];

	// const anotherPlugin = plugin2.build();

	const core = plugin
		.onActivation(async ({ ask, tell }) => {
			tell(
				task(
					E.gen(function* () {
						logged.push(1);
					}),
				),
			);

			const activePlugins = await ask(forActivePlugins());

			/**
			 * Our plugin should already be in the "activePlugins" array.
			 * */
			if (activePlugins.some((pluginName) => pluginName === corePluginName)) {
				logged.push(2);
			}
		})
		.onActivation(async () => {
			logged.push(3);
		})
		.build();

	/**
	 * TODO: must work with multiple activated plugins at once
	 * */
	api.tell(activatePlugins(core));

	await vi.waitFor(() => {
		expect(logged).toEqual([1, 2, 3]);
	});
});

test("it runs deactivation hooks on mount", async () => {
	const api = client();
	const { plugin } = defineApiPlugin("hello");
	const logged: number[] = [];

	const core = plugin
		.onDeactivation(async ({ ask, tell }) => {
			tell(
				task(
					E.gen(function* () {
						logged.push(1);
					}),
				),
			);

			const activePlugins = await ask(forActivePlugins());

			if (!activePlugins.length) {
				logged.push(2);
			}
		})
		.onDeactivation(() => {
			logged.push(3);
		})
		.build();

	/**
	 * TODO: must work with multiple deactivated plugins at once
	 * */
	api.tell(activatePlugins(core));
	api.tell(deactivatePlugins(core));

	await vi.waitFor(() => {
		expect(logged).toEqual([1, 2, 3]);
	});
});
