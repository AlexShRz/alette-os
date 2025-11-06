import { expect } from "@effect/vitest";
import { Duration } from "effect";
import {
	forActiveRequestThreads,
	forActiveRequestWorkers,
} from "../../application";
import { CommandTaskBuilder } from "../../application/plugins/tasks/primitive/CommandTaskBuilder";
import { path, factory } from "../../domain";
import { createTestApi } from "../utils/createTestApi";

const setUp = async (...commands: CommandTaskBuilder[]) => {
	const { api, custom } = createTestApi(...commands);
	const value = "asdasjkdh";

	const getData1 = custom(
		factory(() => {
			return value;
		}),
	);
	/**
	 * This is a different request because
	 * a new middleware has been added
	 * */
	const getData2 = getData1.with(path("/hey"));

	const response1 = await getData1();
	const response2 = await getData2();
	expect(response1).toEqual(value);
	expect(response2).toEqual(value);

	return { api };
};

test("it creates a dedicated request thread for every request config", async () => {
	const { api } = await setUp();

	const activeThreads = await api.ask(forActiveRequestThreads());
	expect(activeThreads.length).toBe(2);
});

test("it disposes of request workers after a request is done", async () => {
	const { api } = await setUp();

	const activeThreads = await api.ask(forActiveRequestWorkers());
	expect(activeThreads.length).toBe(0);
});

/**
 * TODO: Fix later
 * 1. The test works, I just have no idea how to correctly adjust time
 * here using TestClock or vi.useFakeTimers()
 * 2. We also have some scheduled tasks running in the background,
 * this adds to the test complexity
 * */
test.todo(
	"it disposes of request threads after set TTL has elapsed",
	async () => {
		const { api } = await setUp();

		vi.useFakeTimers();
		vi.advanceTimersByTime(Duration.toMillis("1 minute"));
		vi.useRealTimers();

		const activeThreads = await api.ask(forActiveRequestThreads());
		expect(activeThreads.length).toBe(0);
	},
);
