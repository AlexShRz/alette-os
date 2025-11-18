import { vi } from "vitest";
import { debounce, factory, reloadable, runOnMount } from "../../../domain";
import { createTestApi } from "../../utils";
import { tapOnDebounce } from "./debounce.test";

test("it uses default delay in point-free mode", async () => {
	const { api, custom } = createTestApi();
	const returnValue = "asdasdasdas";
	let debounceReached = false;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		debounce,
		tapOnDebounce(() => {
			debounceReached = true;
		}),
		factory(() => {
			return returnValue;
		}),
	);

	const { getState, execute } = getData.mount();
	vi.useFakeTimers();
	execute();

	await vi.waitFor(() => {
		expect(debounceReached).toBeTruthy();
	});

	await api.timeTravel("100 millis");
	await vi.waitFor(async () => {
		expect(getState().data).not.toEqual(returnValue);
	});

	await api.timeTravel("200 millis");
	await vi.waitFor(async () => {
		expect(getState().data).toEqual(returnValue);
	});
});
