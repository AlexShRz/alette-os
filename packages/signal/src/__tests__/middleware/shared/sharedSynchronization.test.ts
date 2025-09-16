import { ApiError } from "@alette/pulse";
import { Subject } from "rxjs";
import { forActiveRequestWorkers } from "../../../application";
import { factory, reloadable, runOnMount, shared } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it keeps mounted requests in sync through the whole request lifecycle", async () => {
	const { custom } = createTestApi();
	const trigger = new Subject<string | MyError>();
	const value = "asdasd";

	class MyError extends ApiError.As("MyError") {
		cloneSelf() {
			return new MyError();
		}
	}

	const getData = custom(
		shared(),
		runOnMount(false),
		reloadable(() => true),
		factory(async () => {
			return await new Promise<string | MyError>((res, reject) => {
				trigger.subscribe({
					next: (v) => {
						if (v instanceof MyError) {
							reject(v);
							return;
						}

						res(v);
					},
				});
			});
		}),
	);

	const inst1 = getData.mount();
	inst1.execute();

	const inst2 = getData.mount();

	await vi.waitFor(() => {
		expect(inst1.getState().isLoading).toBeTruthy();
		expect(inst2.getState().isLoading).toBeTruthy();
	});

	// Add late request
	const inst3 = getData.mount();
	await vi.waitFor(() => {
		expect(inst3.getState().isLoading).toBeTruthy();
	});

	/**
	 * Cancellation start
	 * */
	inst3.cancel();
	await vi.waitFor(() => {
		expect(inst1.getState().isLoading).toBeFalsy();
		expect(inst2.getState().isLoading).toBeFalsy();
		expect(inst3.getState().isLoading).toBeFalsy();
	});
	/**
	 * Cancellation end
	 * */
	/**
	 * Execution start
	 * */
	inst1.execute();
	await vi.waitFor(() => {
		expect(inst1.getState().isLoading).toBeTruthy();
	});
	trigger.next(value);
	await vi.waitFor(() => {
		expect(inst1.getState().data).toEqual(value);
		expect(inst2.getState().data).toEqual(value);
		expect(inst3.getState().data).toEqual(value);
	});
	/**
	 * Execution end
	 * */
	/**
	 * Failure start
	 * */
	inst2.execute();
	await vi.waitFor(() => {
		expect(inst2.getState().isLoading).toBeTruthy();
	});
	trigger.next(new MyError());
	await vi.waitFor(() => {
		expect(inst1.getState().error instanceof MyError).toBeTruthy();
		expect(inst2.getState().error instanceof MyError).toBeTruthy();
		expect(inst3.getState().error instanceof MyError).toBeTruthy();
	});
	/**
	 * Failure end
	 * */
});

test("it removes only manually disposed subscriptions while keeping others intact", async () => {
	const { custom } = createTestApi();
	const trigger = new Subject<string>();
	const value = "asdasd";

	const getData = custom(
		shared(),
		runOnMount(false),
		reloadable(() => true),
		factory(async () => {
			return await new Promise<string>((res) => {
				trigger.subscribe({
					next: (v) => {
						res(v);
					},
				});
			});
		}),
	);

	const inst1 = getData.mount();
	inst1.execute();

	const inst2 = getData.mount();

	await vi.waitFor(() => {
		expect(inst1.getState().isLoading).toBeTruthy();
		expect(inst2.getState().isLoading).toBeTruthy();
	});

	// Add late request
	const inst3 = getData.mount();
	await vi.waitFor(() => {
		expect(inst3.getState().isLoading).toBeTruthy();
	});

	inst1.execute();
	await vi.waitFor(() => {
		expect(inst1.getState().isLoading).toBeTruthy();
		expect(inst2.getState().isLoading).toBeTruthy();
		expect(inst3.getState().isLoading).toBeTruthy();
	});

	/**
	 * Remove single subscription
	 * */
	inst3.unmount();

	trigger.next(value);
	await vi.waitFor(() => {
		expect(inst1.getState().data).toEqual(value);
		expect(inst2.getState().data).toEqual(value);
	});
});

test("it does not interfere with other synchronized request sets", async () => {
	const { api, custom } = createTestApi();
	const trigger = new Subject<string>();
	const value1 = "asdasd";
	const value2 = "asdasdasdasda";

	const getData1 = custom(
		shared(),
		runOnMount(false),
		reloadable(() => true),
		factory(async () => {
			return await new Promise<string>((res) => {
				trigger.subscribe({
					next: (v) => {
						res(v);
					},
				});
			});
		}),
	);
	/**
	 * Because we've added a new middleware here
	 * our request config must copy prev middleware
	 * automatically.
	 * */
	const getData2 = getData1.with(
		factory(() => {
			return value2;
		}),
	);

	/**
	 * Set 1 start
	 * */
	const inst1 = getData1.mount();
	inst1.execute();

	const inst2 = getData1.mount();

	await vi.waitFor(() => {
		expect(inst1.getState().isLoading).toBeTruthy();
		expect(inst2.getState().isLoading).toBeTruthy();
	});

	// Add late request
	const inst3 = getData1.mount();
	await vi.waitFor(() => {
		expect(inst3.getState().isLoading).toBeTruthy();
	});
	/**
	 * Set 1 end
	 * */

	/**
	 * Set 2 start
	 * */
	const inst4 = getData2.mount();
	inst4.execute();

	const inst5 = getData2.mount();
	const inst6 = getData2.mount();

	await vi.waitFor(() => {
		expect(inst4.getState().data).toEqual(value2);
		expect(inst5.getState().data).toEqual(value2);
		expect(inst6.getState().data).toEqual(value2);
	});
	/**
	 * Check worker amount
	 * */
	const workerAmount = await api.ask(forActiveRequestWorkers());
	// 2 because 2 request sets
	expect(workerAmount.length).toBe(2);
	/**
	 * Set 2 end
	 * */

	/**
	 * Set 1 continuation
	 * */
	trigger.next(value1);
	await vi.waitFor(() => {
		expect(inst1.getState().data).toEqual(value1);
		expect(inst2.getState().data).toEqual(value1);
		expect(inst3.getState().data).toEqual(value1);
	});
});
