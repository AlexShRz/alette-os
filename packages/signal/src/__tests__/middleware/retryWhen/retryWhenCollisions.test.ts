import { ApiError } from "@alette/pulse";
import { afterAll } from "vitest";
import { factory, reloadable, retryWhen, runOnMount } from "../../../domain";
import { createTestApi } from "../../utils";

class MyError extends ApiError {
	cloneSelf() {
		return new MyError();
	}
}

afterAll(() => {
	vi.useRealTimers();
});

test("it does not allow retry request command to override current request", async () => {
	const { api, custom } = createTestApi();

	let triedTimes = 0;
	let enteredFactoryTimes = 0;
	let ranRetry = false;
	vi.useFakeTimers();

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			enteredFactoryTimes++;

			if (!triedTimes) {
				triedTimes++;
				throw new MyError();
			}

			/**
			 * Otherwise never resolve
			 * */
			return new Promise(() => {});
		}),
		retryWhen(async (_) => {
			await new Promise<void>((res) => {
				setTimeout(() => res(), 20000);
			});
			ranRetry = true;
			return true;
		}),
	);

	const { getState, execute } = getData.mount();

	/**
	 * 1. Start first request that fails
	 * */
	execute();
	await vi.waitFor(() => {
		expect(getState().isLoading).toBeTruthy();
	});

	/**
	 * 2. Start another request that never resolves
	 * */
	execute();
	await vi.waitFor(() => {
		expect(enteredFactoryTimes).toEqual(2);
	});

	await api.timeTravel("30 seconds");
	await vi.waitFor(() => {
		expect(enteredFactoryTimes).toEqual(2);
		expect(ranRetry).toBeTruthy();
	});
});
