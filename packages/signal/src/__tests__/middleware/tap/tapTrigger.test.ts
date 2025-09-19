import { setContext } from "../../../application";
import {
	path,
	factory,
	reloadable,
	runOnMount,
	tapTrigger,
} from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it is triggered on request execution attempt", async () => {
	const { custom } = createTestApi();
	const path1 = "/heyyy";
	const logger: number[] = [];

	const getData = custom(
		path(path1),
		runOnMount(false),
		reloadable(() => true),
		factory(({ path }) => {
			return path;
		}),
		tapTrigger(() => {
			logger.push(1);
		}),
	);

	const { reload, execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1]);
	});
	reload();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1, 1]);
	});

	await getData.execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1, 1, 1]);
	});
});

test("it can access global context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdsa: "asdas" };
	api.tell(setContext(context));

	const path1 = "/heyyy";
	let caughtContext: typeof context | null = null;

	const getData = custom(
		path(path1),
		runOnMount(false),
		reloadable(() => true),
		tapTrigger(({ context }) => {
			caughtContext = context as any;
		}),
		factory(({ path }) => {
			return path;
		}),
	);

	const { reload, execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(caughtContext).toStrictEqual(context);
		caughtContext = null;
	});
	reload();
	await vi.waitFor(() => {
		expect(caughtContext).toStrictEqual(context);
		caughtContext = null;
	});

	await getData.execute();
	await vi.waitFor(() => {
		expect(caughtContext).toStrictEqual(context);
		caughtContext = null;
	});
});

test("it can be combined", async () => {
	const { custom } = createTestApi();
	const path1 = "/heyyy";
	const logger: number[] = [];

	const getData = custom(
		path(path1),
		runOnMount(false),
		reloadable(() => true),
		tapTrigger(() => {
			logger.push(1);
		}),
		tapTrigger(() => {
			logger.push(2);
		}),
		tapTrigger(async () => {
			logger.push(3);
		}),
		factory(({ path }) => {
			return path;
		}),
	);

	const { reload, execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1, 2, 3]);
	});
	reload();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1, 2, 3, 1, 2, 3]);
	});

	await getData.execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
	});
});
