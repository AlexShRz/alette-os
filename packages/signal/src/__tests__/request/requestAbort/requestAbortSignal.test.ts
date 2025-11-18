import { RequestAbortedError, r, request } from "@alette/pulse";
import { http, delay } from "msw";
import { factory, throws } from "../../../domain";
import { createTestApi } from "../../utils";
import { server } from "../../utils/server";

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

test(
	"it does not broadcast aborted error",
	server.boundary(async () => {
		const { custom, testUrl } = createTestApi();
		let wasAbortSignalTriggered = false;

		server.use(
			http.get(testUrl.build(), async () => {
				await delay("infinite");
			}),
		);

		const getData1 = custom(
			factory(async ({ url }, { signal }) => {
				try {
					await request(
						r.route(url.setOrigin(testUrl.getOrigin())),
						r.signal(signal),
					)();
				} catch (e) {
					if (e instanceof RequestAbortedError) {
						wasAbortSignalTriggered = true;
					}
					throw e;
				}
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
	}),
);

test(
	"it throws request abort error if custom abort signal is used",
	server.boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const logged: any[] = [];
		let factoryReached = false;

		const abortController = new AbortController();
		const signal = abortController.signal;

		server.use(
			http.get(testUrl.build(), async () => {
				await delay("infinite");
			}),
		);

		const getData1 = custom(
			throws(RequestAbortedError),
			factory(async ({ url }) => {
				factoryReached = true;
				return request(
					r.route(url.setOrigin(testUrl.getOrigin())),
					r.signal(signal),
				)();
			}),
		);

		getData1().catch((error) => {
			logged.push(error);
		});

		await vi.waitFor(() => {
			expect(factoryReached).toBeTruthy();
		});
		abortController.abort();

		await vi.waitFor(() => {
			expect(logged[0]).toBeInstanceOf(RequestAbortedError);
		});
	}),
);
