import { setContext } from "../../../application";
import {
	path,
	abortedBy,
	factory,
	reloadable,
	runOnMount,
	tapAbort,
} from "../../../domain";
import { createTestApi } from "../../utils/createTestApi";

test("it is triggered when a request is aborted", async () => {
	const { custom } = createTestApi();
	const logged: any[] = [];
	let reachedFactory = false;

	const abortController = new AbortController();

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		abortedBy(abortController),
		tapAbort(async () => {
			logged.push(1);
		}),
		factory(() => {
			reachedFactory = true;
			return new Promise(() => {});
		}),
	);

	getData.spawn();
	await vi.waitFor(() => {
		expect(reachedFactory).toBeTruthy();
	});

	abortController.abort();
	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
	});
});

test("it is not triggered multiple times if the request has already been aborted", async () => {
	const { custom } = createTestApi();
	const logged: any[] = [];
	let reachedFactory = false;

	const abortController = new AbortController();

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		abortedBy(abortController),
		tapAbort(async () => {
			logged.push(1);
		}),
		factory(() => {
			reachedFactory = true;
			return new Promise(() => {});
		}),
	);

	getData.spawn();
	await vi.waitFor(() => {
		expect(reachedFactory).toBeTruthy();
	});

	abortController.abort();
	abortController.abort();
	abortController.abort();
	abortController.abort();
	abortController.abort();
	abortController.abort();
	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
	});
});

test("it can access request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));

	let reachedFactory = false;
	const abortController = new AbortController();

	let caughtContext: typeof context | null = null;
	let caughtPath: string | null = null;

	const pathValue = "/asdads";

	const getData = custom(
		path(pathValue),
		runOnMount(false),
		reloadable(() => true),
		abortedBy(abortController),
		tapAbort(async ({ context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
		}),
		factory(() => {
			reachedFactory = true;
			return new Promise(() => {});
		}),
	);

	getData.spawn();
	await vi.waitFor(() => {
		expect(reachedFactory).toBeTruthy();
	});

	abortController.abort();
	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
		expect(caughtPath).toBe(pathValue);
	});
});

test("it can be combined", async () => {
	const { custom } = createTestApi();
	const logged: number[] = [];

	let reachedFactory = false;
	const abortController = new AbortController();

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		tapAbort(async () => {
			logged.push(1);
		}),
		abortedBy(abortController),
		factory(() => {
			reachedFactory = true;
			return new Promise(() => {});
		}),
		tapAbort(async () => {
			logged.push(2);
		}),
		tapAbort(() => {
			logged.push(3);
		}),
	);

	getData.spawn();
	await vi.waitFor(() => {
		expect(reachedFactory).toBeTruthy();
	});

	abortController.abort();
	await vi.waitFor(() => {
		expect(logged).toStrictEqual([1, 2, 3]);
	});
});
