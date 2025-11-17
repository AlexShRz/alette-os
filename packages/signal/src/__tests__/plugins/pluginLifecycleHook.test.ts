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
	const { plugin: plugin2, pluginName: otherPluginName } =
		defineApiPlugin("otherPlugin");
	const logged: number[] = [];
	const logged2: number[] = [];

	const anotherPlugin = plugin2
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
			if (activePlugins.some((pluginName) => pluginName === otherPluginName)) {
				logged.push(2);
			}
		})
		.onActivation(async () => {
			logged.push(3);
		})
		.build();

	const core = plugin
		.onActivation(async ({ ask, tell }) => {
			tell(
				task(
					E.gen(function* () {
						logged2.push(1);
					}),
				),
			);

			const activePlugins = await ask(forActivePlugins());

			/**
			 * Our plugin should already be in the "activePlugins" array.
			 * */
			if (activePlugins.some((pluginName) => pluginName === corePluginName)) {
				logged2.push(2);
			}
		})
		.onActivation(async () => {
			logged2.push(3);
		})
		.build();

	api.tell(activatePlugins(core, anotherPlugin));

	await vi.waitFor(() => {
		expect(logged).toEqual([1, 2, 3]);
		expect(logged2).toEqual([1, 2, 3]);
	});
});

test("it runs deactivation hooks on mount", async () => {
	const api = client();
	const { plugin } = defineApiPlugin("hello");
	const { plugin: plugin2 } = defineApiPlugin("otherPlugin");
	const logged: number[] = [];
	const logged2: number[] = [];

	const anotherPlugin = plugin2
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

	const core = plugin
		.onDeactivation(async ({ ask, tell }) => {
			tell(
				task(
					E.gen(function* () {
						logged2.push(1);
					}),
				),
			);

			const activePlugins = await ask(forActivePlugins());

			if (!activePlugins.length) {
				logged2.push(2);
			}
		})
		.onDeactivation(() => {
			logged2.push(3);
		})
		.build();

	api.tell(activatePlugins(core, anotherPlugin));
	api.tell(deactivatePlugins());

	await vi.waitFor(() => {
		expect(logged).toEqual([1, 2, 3]);
		expect(logged2).toEqual([1, 2, 3]);
	});
});
