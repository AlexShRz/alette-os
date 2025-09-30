import { RequestWasCancelledError } from "@alette/pulse";
import { factory } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils";

test("it triggers abort signal during cancellation", async () => {
	const { custom } = createTestApi();
	let wasAbortSignalTriggered = false;

	const getData1 = custom(
		factory(async (_, { signal }) => {
			signal.onabort = () => {
				wasAbortSignalTriggered = true;
			};

			// never resolve
			return await new Promise(() => {});
		}),
	);

	const { getState, execute, cancel } = getData1.mount();

	execute();
	/**
	 * Wait for the loading state
	 * */
	await vi.waitFor(() => {
		expect(getState().isLoading).toBeTruthy();
	});
	cancel();
	await vi.waitFor(() => {
		expect(wasAbortSignalTriggered).toBeTruthy();
	});
});

test("it does not broadcast aborted error", async () => {
	const { custom } = createTestApi();
	let wasAbortSignalTriggered = false;

	const getData1 = custom(
		factory(async (_, { signal }) => {
			return await new Promise((_, reject) => {
				signal.onabort = () => {
					wasAbortSignalTriggered = true;
					reject(new RequestWasCancelledError());
				};
			});
		}),
	);

	const { getState, execute, cancel } = getData1.mount();

	execute();
	/**
	 * Wait for the loading state
	 * */
	await vi.waitFor(() => {
		expect(getState().isLoading).toBeTruthy();
	});
	cancel();
	await vi.waitFor(() => {
		const { error, isLoading, isError } = getState();

		expect(wasAbortSignalTriggered).toBeTruthy();
		expect(error).toEqual(null);
		expect(isLoading).toEqual(false);
		expect(isError).toEqual(false);
	});
});

test("it throws cancellation error if custom abort signal is used", async () => {
	const { custom } = createTestApi();
	const logged: any[] = [];
	let factoryReached = false;

	const abortController = new AbortController();
	const signal = abortController.signal;

	const getData1 = custom(
		factory(async () => {
			return await new Promise((_, reject) => {
				factoryReached = true;
				signal.onabort = () => {
					reject(new RequestWasCancelledError());
				};
			});
		}),
	);

	getData1.execute().catch((error) => {
		logged.push(error);
	});

	await vi.waitFor(() => {
		expect(factoryReached).toBeTruthy();
	});
	abortController.abort();

	await vi.waitFor(() => {
		expect(logged[0]).toBeInstanceOf(RequestWasCancelledError);
	});
});
