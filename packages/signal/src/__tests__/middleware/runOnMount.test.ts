import { setContext } from "../../application";
import { as, factory, input, runOnMount } from "../../domain";
import { createTestApi } from "../utils/createTestApi";

test("it automatically starts requests in mount mode if run on mount is activated", async () => {
	const { custom } = createTestApi();
	const value = "asdasdaasd";

	const getData = custom(
		input(as<string>()),
		runOnMount(),
		factory(() => {
			return value;
		}),
	);

	const { getState } = getData.mount();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(value);
	});
});

test.fails(
	"it does not starts requests in mount mode if run on mount is deactivated",
	async () => {
		const { custom } = createTestApi();
		const value = "asdasdaasd";

		const getData = custom(
			input(as<string>()),
			runOnMount(false),
			factory(() => {
				return value;
			}),
		);

		const { getState } = getData.mount();

		await vi.waitFor(() => {
			expect(getState().data).toEqual(value);
		});
	},
);

test("it disables run on mount check during one shot requests", async () => {
	const { custom } = createTestApi();
	const value = "asdasdaasd";

	const getData = custom(
		input(as<string>()),
		runOnMount(),
		factory(() => {
			return value;
		}),
	);

	const result = await getData.execute();
	expect(result).toEqual(value);
});

test("it overrides previous middleware of the same type", async () => {
	const { custom } = createTestApi();
	const value = "asdasdaasd";

	const getData = custom(
		input(as<string>()),
		runOnMount(false),
		runOnMount(),
		factory(() => {
			return value;
		}),
	);

	const { getState } = getData.mount();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(value);
	});
});

test("it can access global context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasd: "asda" };
	api.tell(setContext(context));

	const data = "asdasd";
	let caughtContext: any = null;

	const getData = custom(
		input(as<string>()),
		runOnMount(async ({ context }) => {
			caughtContext = context;
			return true;
		}),
		factory(() => {
			return data;
		}),
	);

	const { getState } = getData.mount();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(data);
		expect(caughtContext).toEqual(context);
	});
});
