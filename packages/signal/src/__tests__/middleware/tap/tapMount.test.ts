import { setContext } from "../../../application";
import { factory, reloadable, runOnMount, tapMount } from "../../../domain";
import { createTestApi } from "../../utils";

test("it is triggered once on mount", async () => {
	const { custom } = createTestApi();
	const logger: number[] = [];

	const getData = custom(
		runOnMount(true),
		reloadable(() => true),
		factory(() => {
			return true;
		}),
		tapMount(() => {
			logger.push(1);
		}),
	);

	const { execute } = getData.mount();

	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1]);
	});
	execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1]);
	});
});

test("it is not triggered for one shot requests", async () => {
	const { custom } = createTestApi();
	const logger: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			return true;
		}),
		tapMount(() => {
			logger.push(1);
		}),
	);

	await getData();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([]);
	});
});

test("it is triggered on mount even if run on mount behaviour is disabled", async () => {
	const { custom } = createTestApi();
	const logger: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			return true;
		}),
		tapMount(() => {
			logger.push(1);
		}),
	);

	const { execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1]);
	});
	execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1]);
	});
});

test("it can access global context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));

	let caughtContext: typeof context | null = null;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		tapMount(async ({ context }) => {
			caughtContext = context as any;
		}),
		factory(() => {
			return new Promise(() => {});
		}),
	);

	const { execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
	});
});

test("it can be combined", async () => {
	const { custom } = createTestApi();
	const logged: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		tapMount(async () => {
			logged.push(1);
		}),
		factory(() => {
			return new Promise(() => {});
		}),
		tapMount(async () => {
			logged.push(2);
		}),
		tapMount(() => {
			logged.push(3);
		}),
	);

	const { execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logged).toStrictEqual([1, 2, 3]);
	});
});
