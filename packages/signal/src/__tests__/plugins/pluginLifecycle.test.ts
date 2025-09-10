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
	const active2 = await api.ask(forActivePlugins());
	expect(active2).toEqual([]);
});

test("it executes plugin tasks when the plugin is activated", async () => {
	const api = client();
	const { plugin } = defineApiPlugin("hello");
	const logged: number[] = [];

	const core = plugin.build();
	const mailbox = await E.runPromise(core.getMailboxHolder());

	await E.runPromise(
		mailbox.sendCommand(
			task(() =>
				E.gen(function* () {
					logged.push(1);
				}),
			),
		),
	);

	api.tell(activatePlugins(core));

	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
	});
});

test("interrupts all running tasks when a plugin is deactivated", async () => {
	const api = client();
	const { plugin } = defineApiPlugin("hello");
	const logged: number[] = [];

	const core = plugin.build();
	const mailbox = await E.runPromise(core.getMailboxHolder());

	await E.runPromise(
		mailbox.sendCommand(
			task(() =>
				E.gen(function* () {
					yield* E.forever(E.void);
				}).pipe(
					E.onInterrupt(() =>
						E.sync(() => {
							logged.push(1);
						}),
					),
				),
			).concurrent(),
		),
	);

	api.tell(activatePlugins(core));

	await E.runPromise(
		E.sleep(200).pipe(E.andThen(() => api.tell(deactivatePlugins(core)))),
	);

	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
	});
});

test("it deactivates and activate plugins again if passed plugins are already in the registry", async () => {
	const api = client();
	const { plugin } = defineApiPlugin("hello");
	const logged: number[] = [];

	const core = plugin.build();
	const mailbox = await E.runPromise(core.getMailboxHolder());

	await E.runPromise(
		mailbox.sendCommand(
			task(() =>
				E.gen(function* () {
					yield* E.forever(E.void);
				}).pipe(
					E.onInterrupt(() =>
						E.sync(() => {
							logged.push(1);
						}),
					),
				),
			).concurrent(),
		),
	);

	api.tell(activatePlugins(core));

	await E.runPromise(
		E.sleep("100 millis").pipe(
			E.andThen(() => api.tell(activatePlugins(core))),
		),
	);

	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
	});
});
