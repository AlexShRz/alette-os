import { ApiError } from "@alette/pulse";
import { Subject } from "rxjs";
import { factory, output, throws, type } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it can cancel running requests without throwing an error", async () => {
	const { custom } = createTestApi();
	const trigger = new Subject<string>();
	let wasCancelled = false;

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

	const { when, execute, cancel } = getData1.mount();

	when(({ isUninitialized, isError, error, isLoading }) => {
		if (!isUninitialized && !isError && !error && !isLoading) {
			wasCancelled = true;
		}
	});
	execute();
	/**
	 * Wait for the loading state
	 * */
	await new Promise<void>((res) => {
		const unsubscribe = when(({ isLoading }) => {
			if (isLoading) {
				res();
				unsubscribe();
			}
		});
	});
	cancel();
	await vi.waitFor(() => {
		expect(wasCancelled).toBeTruthy();
	});
});

test("it cancels requests without overriding their error and success states", async () => {
	const { custom } = createTestApi();
	const trigger = new Subject<string | MyError>();
	const value = "asdas";

	class MyError extends ApiError {
		cloneSelf() {
			return new MyError();
		}
	}

	const getData1 = custom(
		output(type<string>()),
		throws(MyError),
		factory(async () => {
			return await new Promise<string>((res, reject) => {
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

	const { getState, execute, cancel } = getData1.mount();

	/**
	 * Success Scenario Start
	 * */
	execute();
	await vi.waitFor(() => {
		expect(getState().isLoading).toBeTruthy();
	});

	trigger.next(value);
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value);
	});

	execute();
	await vi.waitFor(() => {
		expect(getState().isLoading).toBeTruthy();
	});

	cancel();
	await vi.waitFor(() => {
		expect(getState().isLoading).toBeFalsy();
		expect(getState().data).toEqual(value);
	});
	/**
	 * Success Scenario End
	 * */

	/**
	 * Error Scenario Start
	 * */
	execute();
	await vi.waitFor(() => {
		expect(getState().isLoading).toBeTruthy();
	});

	trigger.next(new MyError());
	await vi.waitFor(() => {
		expect(getState().error instanceof MyError).toBeTruthy();
	});

	execute();
	await vi.waitFor(() => {
		expect(getState().isLoading).toBeTruthy();
	});

	cancel();
	await vi.waitFor(() => {
		expect(getState().isLoading).toBeFalsy();
		expect(getState().error instanceof MyError).toBeTruthy();
	});
	/**
	 * Error Scenario End
	 * */
});
