import { ApiError } from "@alette/pulse";
import { Subject } from "rxjs";
import { forActiveRequestWorkers } from "../../../application";
import { factory, reloadable, runOnMount, synchronized } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it synchronizes loading state between requests", async () => {
	const { api, custom } = createTestApi();
	const trigger = new Subject<string>();
	let triggeredTimes = 0;

	const getData = custom(
		synchronized(),
		runOnMount(false),
		reloadable(() => true),
		factory(async () => {
			triggeredTimes++;
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
	/**
	 * Make sure only the first instance runs
	 * */
	inst1.execute();

	const inst2 = getData.mount();

	await vi.waitFor(() => {
		expect(inst1.getState().isLoading).toBeTruthy();
		expect(inst2.getState().isLoading).toBeTruthy();
	});

	// Add another late request, but late
	const inst3 = getData.mount();
	await vi.waitFor(() => {
		expect(inst3.getState().isLoading).toBeTruthy();
	});

	const workerAmount = await api.ask(forActiveRequestWorkers());
	expect(workerAmount.length).toEqual(1);
	expect(triggeredTimes).toEqual(1);
});

test("it synchronizes error state between requests", async () => {
	const { api, custom } = createTestApi();
	const trigger = new Subject<string | MyError>();
	let triggeredTimes = 0;

	class MyError extends ApiError {
		cloneSelf() {
			return new MyError();
		}
	}

	const getData = custom(
		synchronized(),
		runOnMount(false),
		reloadable(() => true),
		factory(async () => {
			triggeredTimes++;
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
	});

	trigger.next(new MyError());
	await vi.waitFor(() => {
		expect(inst1.getState().error instanceof MyError).toBeTruthy();
		expect(inst2.getState().error instanceof MyError).toBeTruthy();
	});

	// Add late request
	const inst3 = getData.mount();
	await vi.waitFor(() => {
		expect(inst3.getState().error instanceof MyError).toBeTruthy();
	});

	const workerAmount = await api.ask(forActiveRequestWorkers());
	expect(workerAmount.length).toEqual(1);
	expect(triggeredTimes).toEqual(1);
});

test("it synchronizes success state between requests", async () => {
	const { api, custom } = createTestApi();
	const value = "asdasdas";
	const trigger = new Subject<string>();
	let triggeredTimes = 0;

	const getData = custom(
		synchronized(),
		runOnMount(false),
		reloadable(() => true),
		factory(async () => {
			triggeredTimes++;
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
	});

	trigger.next(value);
	await vi.waitFor(() => {
		expect(inst1.getState().data).toEqual(value);
		expect(inst2.getState().data).toEqual(value);
	});

	// Add late request
	const inst3 = getData.mount();
	await vi.waitFor(() => {
		expect(inst3.getState().data).toEqual(value);
	});

	const workerAmount = await api.ask(forActiveRequestWorkers());
	expect(workerAmount.length).toEqual(1);
	expect(triggeredTimes).toEqual(1);
});

test("it synchronizes cancellation state between requests", async () => {
	const { api, custom } = createTestApi();
	const trigger = new Subject<string>();
	let triggeredTimes = 0;

	const getData = custom(
		synchronized(),
		runOnMount(false),
		reloadable(() => true),
		factory(async () => {
			triggeredTimes++;
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
	inst3.cancel();
	await vi.waitFor(() => {
		expect(inst1.getState().isLoading).toBeFalsy();
		expect(inst2.getState().isLoading).toBeFalsy();
		expect(inst3.getState().isLoading).toBeFalsy();
	});

	const workerAmount = await api.ask(forActiveRequestWorkers());
	expect(workerAmount.length).toEqual(1);
	expect(triggeredTimes).toEqual(1);
});
