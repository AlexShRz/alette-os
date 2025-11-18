import {
	RequestAbortedError,
	abortedBy,
	factory,
	reloadable,
	runOnMount,
	tapAbort,
} from "../../../domain";
import { createTestApi } from "../../utils";

test("it aborts nested requests", async () => {
	const { custom } = createTestApi();
	const logged: any[] = [];
	const abortedLog: number[] = [];
	let factoryReached = false;

	const abortController = new AbortController();

	const getData1 = custom(
		tapAbort(() => {
			abortedLog.push(1);
		}),
		factory(() => {
			// never resolve
			return new Promise(() => {});
		}),
	);
	const getData2 = custom(
		tapAbort(() => {
			abortedLog.push(2);
		}),
		factory(() => {
			// never resolve
			return new Promise(() => {});
		}),
	);

	const getCombinedData = custom(
		abortedBy(abortController),
		factory(async (_, { signal }) => {
			factoryReached = true;

			await Promise.all([
				getData1.with(abortedBy(signal))(),
				getData2.with(abortedBy(signal))(),
			]);

			return true;
		}),
	);

	const pendingRequest = getCombinedData();
	pendingRequest.catch((error) => {
		logged.push(error);
	});

	await vi.waitFor(() => {
		expect(factoryReached).toBeTruthy();
	});
	abortController.abort();

	await vi.waitFor(() => {
		expect(logged[0]).toBeInstanceOf(RequestAbortedError);
		expect(abortedLog).toEqual([1, 2]);
	});
});

test("it aborts nested requests during main request cancellation", async () => {
	const { custom } = createTestApi();
	const abortedLog: number[] = [];
	let factoryReached = false;

	const getData1 = custom(
		tapAbort(() => {
			abortedLog.push(1);
		}),
		factory(() => {
			// never resolve
			return new Promise(() => {});
		}),
	);
	const getData2 = custom(
		tapAbort(() => {
			abortedLog.push(2);
		}),
		factory(() => {
			// never resolve
			return new Promise(() => {});
		}),
	);

	const getCombinedData = custom(
		runOnMount(false),
		reloadable(() => true),
		factory(async (_, { signal }) => {
			factoryReached = true;

			await Promise.all([
				getData1.with(abortedBy(signal))(),
				getData2.with(abortedBy(signal))(),
			]);

			return true;
		}),
	);

	const { execute, getState, cancel } = getCombinedData.mount();
	execute();

	await vi.waitFor(() => {
		expect(factoryReached).toBeTruthy();
	});
	cancel();

	await vi.waitFor(() => {
		expect(getState().error).toBe(null);
		expect(abortedLog).toEqual([1, 2]);
	});
});
