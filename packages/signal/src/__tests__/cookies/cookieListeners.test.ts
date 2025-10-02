import { setContext } from "../../application";
import { createTestApi } from "../utils";

test("it triggers listeners on every cookie lifecycle event", async () => {
	const { cookie } = createTestApi();
	const logged: number[] = [];

	const myCookie = cookie()
		.from(async () => {})
		.build();

	myCookie.onStatus({
		invalid: async () => {
			logged.push(1);
		},
		loading: async () => {
			logged.push(2);
		},
		valid: async () => {
			logged.push(3);
		},
	});

	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
	});

	await myCookie.load();

	await vi.waitFor(() => {
		expect(logged).toEqual([1, 2, 3]);
	});

	myCookie.invalidate();
	await vi.waitFor(() => {
		expect(logged).toEqual([1, 2, 3, 1]);
	});
});

test("it unsubscribes listeners", async () => {
	const { cookie } = createTestApi();
	const logged: number[] = [];

	const myCookie = cookie()
		.from(async () => {})
		.build();

	const unsubscribe = myCookie.onStatus({
		invalid: async () => {
			logged.push(1);
		},
		loading: async () => {
			logged.push(2);
		},
		valid: async () => {
			logged.push(3);
		},
	});

	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
	});

	unsubscribe();
	await myCookie.load();

	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
	});

	myCookie.invalidate();
	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
	});
});

test("it allows listeners to access global context", async () => {
	const { api, cookie } = createTestApi();
	const context = { asdasd: "asd" };
	api.tell(setContext(context));

	let caughtContext1: typeof context | null = null;
	let caughtContext2: typeof context | null = null;
	let caughtContext3: typeof context | null = null;
	const logged: number[] = [];

	const myCookie = cookie()
		.from(async () => {})
		.build();

	myCookie.onStatus({
		invalid: async ({ context }) => {
			caughtContext1 = context as any;
			logged.push(1);
		},
		loading: async ({ context }) => {
			caughtContext2 = context as any;
			logged.push(2);
		},
		valid: async ({ context }) => {
			caughtContext3 = context as any;
			logged.push(3);
		},
	});

	await vi.waitFor(() => {
		expect(logged).toEqual([1]);
		expect(caughtContext1).toEqual(context);
	});

	await myCookie.load();

	await vi.waitFor(() => {
		expect(logged).toEqual([1, 2, 3]);
		expect(caughtContext2).toEqual(context);
		expect(caughtContext3).toEqual(context);
	});
});
