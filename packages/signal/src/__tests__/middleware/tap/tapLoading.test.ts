import { setContext } from "../../../application";
import {
	path,
	factory,
	reloadable,
	runOnMount,
	tapLoading,
} from "../../../domain";
import { createTestApi } from "../../utils/createTestApi";

test("it is triggered on request loading", async () => {
	const { custom } = createTestApi();
	let triggered = 0;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		tapLoading(async () => {
			triggered++;
		}),
		factory(() => {
			// Never resolve
			return new Promise(() => {});
		}),
	);

	getData.spawn();
	await vi.waitFor(() => {
		expect(triggered).toEqual(1);
	});
});

test("it can access request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));

	let caughtContext: typeof context | null = null;
	let caughtPath: string | null = null;

	const pathValue = "/asdads";

	const getData = custom(
		path(pathValue),
		runOnMount(false),
		reloadable(() => true),
		tapLoading(async ({ context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
		}),
		factory(() => {
			// Never resolve
			return new Promise(() => {});
		}),
	);

	getData.spawn();
	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
		expect(caughtPath).toBe(pathValue);
	});
});

test("it can be combined", async () => {
	const { custom } = createTestApi();
	const logged: number[] = [];
	const myResponse = "asda";

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		tapLoading(async () => {
			logged.push(1);
		}),
		factory(() => {
			return myResponse;
		}),
		tapLoading(async () => {
			logged.push(2);
		}),
		tapLoading(() => {
			logged.push(3);
		}),
	);

	const { reload, execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logged).toStrictEqual([1, 2, 3]);
	});
	reload();
	await vi.waitFor(() => {
		expect(logged).toStrictEqual([1, 2, 3, 1, 2, 3]);
	});

	getData().catch(() => {});
	await vi.waitFor(() => {
		expect(logged).toStrictEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
	});
});
