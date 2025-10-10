import { http, delay } from "msw";
import { RequestAbortedError, factory } from "../../../domain";
import { createTestApi, server } from "../../utils";
import { boundary } from "../../utils/server";

test(
	"it throws an error when a request is aborted manually",
	boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const logged: any[] = [];
		let factoryReached = false;

		server.use(
			http.get(testUrl.build(), async () => {
				await delay("infinite");
			}),
		);

		const getData1 = custom(
			factory(() => {
				factoryReached = true;
				// never resolve
				return new Promise(() => {});
			}),
		);

		const pendingRequest = getData1.execute();
		pendingRequest.catch((error) => {
			logged.push(error);
		});

		await vi.waitFor(() => {
			expect(factoryReached).toBeTruthy();
		});

		pendingRequest.abort();
		await vi.waitFor(() => {
			expect(logged[0]).toBeInstanceOf(RequestAbortedError);
		});
	}),
);

test(
	"it cannot abort a finished request",
	boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const logged: any[] = [];
		let factoryReached = false;

		server.use(
			http.get(testUrl.build(), async () => {
				await delay("infinite");
			}),
		);

		const getData1 = custom(
			factory(() => {
				factoryReached = true;
				// never resolve
				return new Promise(() => {});
			}),
		);

		const pendingRequest = getData1.execute();
		pendingRequest.catch((error) => {
			logged.push(error);
		});

		await vi.waitFor(() => {
			expect(factoryReached).toBeTruthy();
		});

		/**
		 * Call abort() multiple times
		 * */
		pendingRequest.abort();
		pendingRequest.abort();
		pendingRequest.abort();
		pendingRequest.abort();
		pendingRequest.abort();
		pendingRequest.abort();
		pendingRequest.abort();
		await vi.waitFor(() => {
			expect(logged.length).toEqual(1);
			expect(logged[0]).toBeInstanceOf(RequestAbortedError);
		});

		pendingRequest.abort();
		pendingRequest.abort();
		await vi.waitFor(() => {
			expect(logged.length).toEqual(1);
		});
	}),
);
