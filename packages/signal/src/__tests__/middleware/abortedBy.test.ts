import {
	RequestAbortedError,
	abortedBy,
	factory,
	reloadable,
	runOnMount,
	throws,
} from "../../domain";
import { createTestApi } from "../utils";

test("it throws an error when a request is aborted manually", async () => {
	const { custom } = createTestApi();
	const logged: any[] = [];
	let factoryReached = false;

	const abortController = new AbortController();

	const getData1 = custom(
		abortedBy(abortController),
		factory(() => {
			factoryReached = true;
			// never resolve
			return new Promise(() => {});
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
		expect(logged[0]).toBeInstanceOf(RequestAbortedError);
	});
});

test("it throws an error for mounted requests when a request is aborted manually", async () => {
	const { custom } = createTestApi();
	let factoryReached = false;

	const abortController = new AbortController();

	const getData1 = custom(
		runOnMount(false),
		reloadable(() => true),
		abortedBy(abortController),
		factory(() => {
			factoryReached = true;
			// never resolve
			return new Promise(() => {});
		}),
	);

	const { getState, execute } = getData1.mount();
	execute();

	await vi.waitFor(() => {
		expect(factoryReached).toBeTruthy();
	});

	abortController.abort();
	await vi.waitFor(() => {
		expect(getState().error).toBeInstanceOf(RequestAbortedError);
	});
});

test("it cannot abort a finished request", async () => {
	const { custom } = createTestApi();
	const logged: any[] = [];
	let factoryReached = false;

	const abortController = new AbortController();

	const getData1 = custom(
		abortedBy(abortController),
		factory(() => {
			factoryReached = true;
			// never resolve
			return new Promise(() => {});
		}),
	);

	getData1.execute().catch((error) => {
		logged.push(error);
	});

	await vi.waitFor(() => {
		expect(factoryReached).toBeTruthy();
	});

	abortController.abort();

	/**
	 * Call abort() multiple times
	 * */
	abortController.abort();
	abortController.abort();
	abortController.abort();
	abortController.abort();
	abortController.abort();
	abortController.abort();
	abortController.abort();
	await vi.waitFor(() => {
		expect(logged.length).toEqual(1);
		expect(logged[0]).toBeInstanceOf(RequestAbortedError);
	});

	abortController.abort();
	abortController.abort();
	await vi.waitFor(() => {
		expect(logged.length).toEqual(1);
	});
});

test("it makes sure the abort error is recognizable by the api", async () => {
	const { custom } = createTestApi();
	const logged: any[] = [];
	let factoryReached = false;

	const abortController = new AbortController();

	const getData1 = custom(
		/**
		 * throws() has no recognized errors set by default here.
		 * If abortedBy() does nothing, we should get a fatal api error
		 * logged to the console.
		 * */
		throws(),
		abortedBy(abortController),
		factory(() => {
			factoryReached = true;
			// never resolve
			return new Promise(() => {});
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
		expect(logged[0]).toBeInstanceOf(RequestAbortedError);
	});
});

test.fails("it overrides previous middleware of the same type", async () => {
	const { custom } = createTestApi();
	const logged: any[] = [];
	let factoryReached = false;

	const abortController1 = new AbortController();
	const abortController2 = new AbortController();

	const getData1 = custom(
		abortedBy(abortController1),
		abortedBy(abortController2),
		factory(() => {
			factoryReached = true;
			// never resolve
			return new Promise(() => {});
		}),
	);

	getData1.execute().catch((error) => {
		logged.push(error);
	});

	await vi.waitFor(() => {
		expect(factoryReached).toBeTruthy();
	});

	abortController1.abort();
	await vi.waitFor(() => {
		expect(logged[0]).toBeInstanceOf(RequestAbortedError);
	});
});
