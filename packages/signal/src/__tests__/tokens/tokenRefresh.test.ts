import { beforeEach } from "@effect/vitest";
import { createTestApi } from "../utils";

beforeEach(() => {
	vi.useRealTimers();
});

test("it refreshes tokens automatically after a specified amount of time", async () => {
	const { api, token } = createTestApi();
	let calledTimes = 0;

	vi.useFakeTimers();

	token()
		.from(async () => {
			calledTimes++;
			return "asdsad";
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

test("it refreshes tokens even if they are valid", async () => {
	const { api, token } = createTestApi();
	let calledTimes = 0;

	vi.useFakeTimers();

	const myToken = token()
		.from(async () => {
			calledTimes++;
			return "asdsad";
		})
		.refreshEvery("15 seconds")
		.build();

	await myToken.get();
	expect(await myToken.isValid()).toBeTruthy();
	expect(calledTimes).toEqual(1);

	await api.timeTravel("15 seconds");
	expect(calledTimes).toEqual(2);
});
