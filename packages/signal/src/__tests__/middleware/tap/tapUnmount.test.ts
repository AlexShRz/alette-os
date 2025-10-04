import { setContext } from "../../../application";
import { factory, reloadable, runOnMount, tapUnmount } from "../../../domain";
import { createTestApi } from "../../utils/createTestApi";

test("it is triggered on request unmount", async () => {
	const { custom } = createTestApi();
	const logger: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			return true;
		}),
		tapUnmount(() => {
			logger.push(1);
		}),
	);

	const { getState, unmount, execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(true);
	});

	unmount();
	await vi.waitFor(() => {
		expect(logger).toEqual([1]);
	});
});

test("it is not triggered for one shot request", async () => {
	const { custom } = createTestApi();
	const logger: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			return true;
		}),
		tapUnmount(() => {
			logger.push(1);
		}),
	);

	const result = await getData.execute();
	expect(result).toEqual(true);

	await vi.waitFor(() => {
		expect(logger).toEqual([]);
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
		tapUnmount(async ({ context }) => {
			caughtContext = context as any;
		}),
		factory(() => {
			return true;
		}),
	);

	const { getState, execute, unmount } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(true);
	});

	unmount();
	await vi.waitFor(() => {
		expect(caughtContext).toEqual(context);
	});
});

test("it runs tap unmount in reverse when multiple taps are present", async () => {
	const { custom } = createTestApi();
	const logger: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		tapUnmount(() => {
			logger.push(1);
		}),
		tapUnmount(() => {
			logger.push(2);
		}),
		tapUnmount(async () => {
			logger.push(3);
		}),
		factory(() => {
			return true;
		}),
	);

	const { getState, execute, unmount } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(true);
	});

	unmount();
	await vi.waitFor(() => {
		expect(logger).toEqual([3, 2, 1]);
	});
});
