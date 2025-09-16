import { ApiError } from "@alette/pulse";
import { expect } from "@effect/vitest";
import { BehaviorSubject, Subject } from "rxjs";
import { forActiveRequestWorkers } from "../../../application";
import { factory, throws } from "../../../domain";
import { RequestState } from "../../../domain/execution/events/request/RequestState";
import { IOneShotRequestState } from "../../../domain/execution/state/IOneShotRequestState";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it keeps request worker alive until the subscription is disposed of", async () => {
	const { api, custom } = createTestApi();
	const value = "asdasjkdh";

	const getData1 = custom(
		factory(() => {
			return value;
		}),
	);

	const { execute, unmount } = getData1.mount();

	const workers1 = await api.ask(forActiveRequestWorkers());
	expect(workers1.length).toBe(0);

	execute();

	await vi.waitFor(async () => {
		const workers2 = await api.ask(forActiveRequestWorkers());
		expect(workers2.length).toBe(1);
	});

	unmount();

	await vi.waitFor(async () => {
		const workers3 = await api.ask(forActiveRequestWorkers());
		expect(workers3.length).toBe(0);
	});
});

test("it reuses the same worker for next requests dispatched from the same subscription", async () => {
	const { api, custom } = createTestApi();
	const value = "asdasjkdh";

	const getData1 = custom(
		factory(() => {
			return value;
		}),
	);

	const { execute } = getData1.mount();

	execute();
	execute();
	execute();
	execute();
	execute();

	await vi.waitFor(async () => {
		const workers2 = await api.ask(forActiveRequestWorkers());
		expect(workers2.length).toBe(1);
	});
});

/**
 * Tested states:
 * "uninitialized/loading/error/success"
 * */
test("it updates state snapshots based on actual request state", async () => {
	const { custom } = createTestApi();
	const value = "asdasjkdh";
	const trigger = new Subject<string | MyError>();
	let uninitializedStateOccurred = 0;
	let loadingStateOccurred = 0;
	let errorStateOccurred = 0;
	let successStateOccurred = 0;

	class MyError extends ApiError {
		cloneSelf() {
			return new MyError();
		}
	}

	const getData1 = custom(
		throws(MyError),
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

	const { when, execute } = getData1.mount();

	when(({ isLoading, isUninitialized, isError, isSuccess, data, error }) => {
		if (isUninitialized) {
			uninitializedStateOccurred = uninitializedStateOccurred + 1;
		}

		if (isLoading) {
			loadingStateOccurred = loadingStateOccurred + 1;
		}

		if (isError && !isLoading && error) {
			errorStateOccurred = errorStateOccurred + 1;
		}

		if (isSuccess && !isLoading && data) {
			successStateOccurred = successStateOccurred + 1;
		}
	});

	await vi.waitFor(async () => {
		expect(uninitializedStateOccurred).toBe(1);
	});
	execute();
	await vi.waitFor(async () => {
		expect(loadingStateOccurred).toBe(1);
	});
	trigger.next(value);
	await vi.waitFor(async () => {
		expect(successStateOccurred).toBe(1);
	});

	execute();
	await vi.waitFor(async () => {
		expect(loadingStateOccurred).toBe(2);
	});
	trigger.next(new MyError());
	await vi.waitFor(async () => {
		expect(errorStateOccurred).toBe(1);
	});
	/**
	 * Recheck uninitialized just to be sure
	 * */
	await vi.waitFor(async () => {
		expect(uninitializedStateOccurred).toBe(1);
	});
});

test("it keeps previous data during refetch", async () => {
	const { custom } = createTestApi();
	const value1 = "asdasjkdh";
	const value2 = "ssss";
	const current: any[] = [];
	const trigger = new BehaviorSubject<string>(value1);

	const getData1 = custom(
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

	const { when, execute } = getData1.mount();

	when(({ isLoading, isSuccess, data }) => {
		if (isLoading) {
			current.push(data);
		}

		if (isSuccess && !isLoading && data) {
			current.push(data);
		}
	});

	execute();
	await vi.waitFor(async () => {
		expect(current).toStrictEqual([null, value1]);
	});

	trigger.next(value2);
	execute();
	await vi.waitFor(async () => {
		expect(current).toStrictEqual([null, value1, value1, value2]);
	});
});

test("it returns full state snapshots on every request state update", async () => {
	const { custom } = createTestApi();
	const value = "asdasdas";
	const trigger = new Subject<string | MyError>();
	let lastSnapshot: IOneShotRequestState.AnyUnwrapped | null = null;

	class MyError extends ApiError {
		cloneSelf() {
			return new MyError();
		}
	}

	const getData1 = custom(
		throws(MyError),
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

	const request1 = getData1.mount();

	request1.when((snapshot) => {
		lastSnapshot = snapshot;
	});

	request1.execute();
	await vi.waitFor(async () => {
		expect(lastSnapshot).toStrictEqual(
			RequestState.Loading().getUnwrappedState(),
		);
	});
	trigger.next(value);
	await vi.waitFor(async () => {
		expect(lastSnapshot).toStrictEqual(
			RequestState.Succeeded(value).getUnwrappedState(),
		);
	});
	request1.unmount();

	const request2 = getData1.mount();
	const error = new MyError();
	request2.when((snapshot) => {
		lastSnapshot = snapshot;
	});
	request2.execute();
	/**
	 * We need to wait for loading state first
	 * */
	await vi.waitFor(async () => {
		expect(lastSnapshot).toStrictEqual(
			RequestState.Loading().getUnwrappedState(),
		);
	});
	trigger.next(error);
	await vi.waitFor(async () => {
		const { error, ...dataWithoutError } = lastSnapshot ?? {};
		expect(error instanceof MyError).toBeTruthy();

		const { error: e, ...expectedDataWithoutError } =
			RequestState.Failed(error).getUnwrappedState();

		expect(dataWithoutError).toStrictEqual(expectedDataWithoutError);
	});
});
