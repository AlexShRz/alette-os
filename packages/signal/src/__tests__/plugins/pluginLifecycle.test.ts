import { expect } from "@effect/vitest";
import * as E from "effect/Effect";
import {
	activatePlugins,
	deactivatePlugins,
	defineApiPlugin,
	forActivePlugins,
} from "../../application";
import { forActiveThreadRegistries } from "../../application/tasks/queries/forActiveThreadRegistries";
import { client } from "../../infrastructure/ApiClient.js";

test("it activates plugins", async () => {
	const api = client();
	const { plugin: plugin1 } = defineApiPlugin("hello");
	const { plugin: plugin2 } = defineApiPlugin("hello1");
	const { plugin: plugin3 } = defineApiPlugin("hello2");

	const core1 = plugin1.build();
	const core2 = plugin2.build();
	const core3 = plugin3.build();

	api.tell(activatePlugins(core1, core2, core3));
	const active = await api.ask(forActivePlugins());
	expect(active).toStrictEqual(["hello", "hello1", "hello2"]);
});

test("it deactivates plugins", async () => {
	const api = client();
	const { plugin: plugin1 } = defineApiPlugin("hello");
	const { plugin: plugin2 } = defineApiPlugin("hello1");
	const { plugin: plugin3 } = defineApiPlugin("hello2");

	const core1 = plugin1.build();
	const core2 = plugin2.build();
	const core3 = plugin3.build();

	api.tell(activatePlugins(core1, core2, core3));
	const active = await api.ask(forActivePlugins());
	expect(active).toStrictEqual(["hello", "hello1", "hello2"]);

	api.tell(deactivatePlugins(core1, core2, core3));

	await vi.waitFor(async () => {
		const active2 = await api.ask(forActivePlugins());
		expect(active2).toEqual([]);
	});
});

test("it deactivates all plugins if nothing was passed to the deactivation command", async () => {
	const api = client();
	const { plugin: plugin1 } = defineApiPlugin("hello");
	const { plugin: plugin2 } = defineApiPlugin("hello1");
	const { plugin: plugin3 } = defineApiPlugin("hello2");

	const core1 = plugin1.build();
	const core2 = plugin2.build();
	const core3 = plugin3.build();

	api.tell(activatePlugins(core1, core2, core3));
	const active = await api.ask(forActivePlugins());
	expect(active).toStrictEqual(["hello", "hello1", "hello2"]);

	api.tell(deactivatePlugins());

	await vi.waitFor(async () => {
		const active2 = await api.ask(forActivePlugins());
		expect(active2).toEqual([]);
	});
});

test("it creates a dedicated thread registry for each plugin", async () => {
	const api = client();
	const { plugin: plugin1 } = defineApiPlugin("hello");
	const { plugin: plugin2 } = defineApiPlugin("hello1");
	const { plugin: plugin3 } = defineApiPlugin("hello2");

	const core1 = plugin1.build();
	const core2 = plugin2.build();
	const core3 = plugin3.build();

	api.tell(activatePlugins(core1, core2, core3));
	const active1 = await api.ask(forActiveThreadRegistries());
	expect(active1.length).toEqual(3);

	api.tell(deactivatePlugins(core1, core2, core3));

	const active2 = await api.ask(forActiveThreadRegistries());
	expect(active2.length).toEqual(0);
});

test("it executes plugin tasks when the plugin is activated", async () => {
	const api = client();
	const { plugin } = defineApiPlugin("hello");
	const logged: number[] = [];

	const core = plugin.build();

	core.getScheduler().schedule(
		E.gen(function* () {
			logged.push(1);
		}),
	);

	api.tell(activatePlugins(core));

	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
	});
});

/**
 * TODO: We need a proper task scheduling system for it to work
 * */
test.todo(
	"interrupts all running tasks when a plugin is deactivated",
	async () => {
		const api = client();
		const { plugin } = defineApiPlugin("hello");
		const logged: number[] = [];

		const core = plugin.build();

		core.getScheduler().schedule(
			E.gen(function* () {
				yield* E.forever(E.void);
			}).pipe(
				E.onInterrupt(() =>
					E.sync(() => {
						logged.push(1);
					}),
				),
			),
		);
		/**
		 * 1. Make sure to test forked tasks too.
		 * 2. Keep in mind, that using "forkScoped" will enter a deadlock.
		 * */
		core.getScheduler().schedule(
			E.gen(function* () {
				yield* E.forever(E.void);
			}).pipe(
				E.onInterrupt(() =>
					E.sync(() => {
						logged.push(2);
					}),
				),
				E.fork,
			),
		);

		api.tell(activatePlugins(core));
		api.tell(deactivatePlugins());

		await vi.waitFor(() => {
			expect(logged).toEqual([1, 2]);
		});
	},
);
