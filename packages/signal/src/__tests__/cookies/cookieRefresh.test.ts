import { beforeEach } from "@effect/vitest";
import { createTestApi } from "../../shared/testUtils";

beforeEach(() => {
	vi.useRealTimers();
});

test("it refreshes cookies automatically after a specified amount of time", async () => {
	const { api, cookie } = createTestApi();
	let calledTimes = 0;

	vi.useFakeTimers();

	cookie()
		.from(async () => {
			calledTimes++;
		})
		.refreshEvery("15 seconds")
		.build();

	await api.timeTravel("15 seconds");
	expect(calledTimes).toEqual(1);

	await api.timeTravel("15 seconds");
	expect(calledTimes).toEqual(2);

	await api.timeTravel("15 seconds");
	expect(calledTimes).toEqual(3);
});

test("it refreshes cookies even if they are valid", async () => {
	const { api, cookie } = createTestApi();
	let calledTimes = 0;

	vi.useFakeTimers();

	const myCookie = cookie()
		.from(async () => {
			calledTimes++;
		})
		.refreshEvery("15 seconds")
		.build();

	await myCookie.load();
	expect(await myCookie.isValid()).toBeTruthy();
	expect(calledTimes).toEqual(1);

	await api.timeTravel("15 seconds");
	expect(calledTimes).toEqual(2);
});
