import { setContext } from "../../application";
import {
	path,
	as,
	factory,
	map,
	output,
	reloadable,
	responseAdapter,
	runOnMount,
} from "../../domain";
import { createTestApi } from "../utils/createTestApi";

test("it can map response", async () => {
	const { custom } = createTestApi();
	const myResponse = "asda";
	const suffix = "asdasdadasdasdasd";
	const expected = `${myResponse}${suffix}`;

	const getData = custom(
		output(as<string>()),
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			return myResponse;
		}),
		map((response) => `${response}${suffix}`),
	);

	const res = await getData.execute();
	await vi.waitFor(() => {
		expect(res).toEqual(expected);
	});

	const { getState, execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(expected);
	});
});

test("it can be composed", async () => {
	const { custom } = createTestApi();
	const myResponse = "asda";
	const suffix1 = "asdasdadasdasdasd";
	const suffix2 = "sd";
	const suffix3 = "324234";
	const expected = `${myResponse}${suffix1}${suffix2}${suffix3}`;

	const getData = custom(
		output(as<string>()),
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			return myResponse;
		}),
		map((response) => `${response}${suffix1}`),
		map(async (response) => `${response}${suffix2}`),
		map(async (response) => `${response}${suffix3}`),
	);

	const res = await getData.execute();
	await vi.waitFor(() => {
		expect(res).toEqual(expected);
	});

	const { getState, execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(expected);
	});
});

test("it can map response to different format", async () => {
	const { custom } = createTestApi();
	const myResponse = "asda";
	const expected = { res: myResponse };

	const getData = custom(
		output(as<string>()),
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			return myResponse;
		}),
		map(() => ({ res: myResponse })),
	);

	const res = await getData.execute();
	await vi.waitFor(() => {
		expect(res).toEqual(expected);
	});

	const { getState, execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(expected);
	});
});

test("it has access to request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));
	const myResponse = "asda";

	let caughtContext: typeof context | null = null;
	let caughtPath: string | null = null;

	const pathValue = "/asdads";

	const getData = custom(
		path(pathValue),
		runOnMount(false),
		reloadable(() => true),
		map(async (response, { context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
			return response;
		}),
		factory(() => {
			return myResponse;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
		expect(caughtPath).toBe(pathValue);
	});
});

test("it allows users to map response into response adapters", async () => {
	const { custom } = createTestApi();
	const myResponse = "asda";
	const expected = { hey: myResponse };

	const MyResponseRecord = responseAdapter()
		.schema(as<{ hey: string }>())
		.build();

	const getData = custom(
		output(as<string>()),
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			return "asdasd";
		}),
		map(async () => MyResponseRecord.from({ ...expected })),
		map((response) => response),
	);

	const res = await getData.execute();
	await vi.waitFor(() => {
		expect(res).toStrictEqual(expected);
	});

	const { getState, execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		expect(getState().data).toStrictEqual({ ...expected });
	});
});
