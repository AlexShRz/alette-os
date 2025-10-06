import { setContext } from "../../../../application";
import {
	factory,
	reloadable,
	runOnMount,
	tapTrigger,
} from "../../../../domain";
import { createTestApi } from "../../../utils/createTestApi";

test("it is triggered on request execution attempt", async () => {
	const { custom } = createTestApi();
	const logger: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			return true;
		}),
		tapTrigger(() => {
			logger.push(1);
		}),
	);

	const { execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1]);
	});

	await getData.execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1, 1]);
	});
});

test("it is not triggered on reload", async () => {
	const { custom } = createTestApi();
	const logger: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			return true;
		}),
		tapTrigger(() => {
			logger.push(1);
		}),
	);

	const { reload } = getData.mount();

	reload();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([]);
	});
	reload();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([]);
	});
	reload();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([]);
	});
});

test("it can access global context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdsa: "asdas" };
	api.tell(setContext(context));

	let caughtContext: typeof context | null = null;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		tapTrigger(({ context }) => {
			caughtContext = context as any;
		}),
		factory(() => {
			return true;
		}),
	);

	const { execute } = getData.mount();

	execute();
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
	const logger: number[] = [];

	const getData = custom(
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
		factory(() => {
			return true;
		}),
	);

	const { execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1, 2, 3]);
	});

	await getData.execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1, 2, 3, 1, 2, 3]);
	});
});
