import { expect } from "@effect/vitest";
import {
	activatePlugins,
	defineApiPlugin,
	forActivePlugins,
} from "../../application";
import { client } from "../../infrastructure/ApiClient.js";

test("it respects task order", async () => {
	const api = client();
	const name1 = "hello";
	const name2 = "hello1";
	const name3 = "hello2";
	const { plugin: plugin1 } = defineApiPlugin(name1);
	const { plugin: plugin2 } = defineApiPlugin(name2);
	const { plugin: plugin3 } = defineApiPlugin(name3);

	const core1 = plugin1.build();
	const core2 = plugin2.build();
	const core3 = plugin3.build();

	const active1 = await api.ask(forActivePlugins());
	expect(active1).toEqual([]);

	api.tell(activatePlugins(core1));
	const active2 = await api.ask(forActivePlugins());
	expect(active2).toEqual([name1]);

	api.tell(activatePlugins(core2));
	const active3 = await api.ask(forActivePlugins());
	expect(active3).toEqual([name1, name2]);

	api.tell(activatePlugins(core3));
	const active4 = await api.ask(forActivePlugins());
	expect(active4).toStrictEqual([name1, name2, name3]);
});
