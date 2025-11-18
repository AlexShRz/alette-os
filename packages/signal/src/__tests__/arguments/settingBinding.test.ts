import { as, factory, input } from "../../domain";
import { createTestApi } from "../utils/createTestApi";

test("it uses bound setting provider if no settings were provided manually (oneShot + mount mode)", async () => {
	const { custom } = createTestApi();
	const bound = "asdasdaasd";

	const getData = custom(
		input(as<string>()),
		factory(({ args }) => {
			return args;
		}),
	).using(() => ({ args: bound }));

	const res = await getData();
	expect(res).toEqual(bound);

	const { getState, execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(bound);
	});
});

test("it overrides default setting provider with settings provided manually (oneShot + mount mode)", async () => {
	const { custom } = createTestApi();
	const bound = "asdasdaasd";
	const manual = "xcsds";

	const getData = custom(
		input(as<string>()),
		factory(({ args }) => {
			return args;
		}),
	).using(() => ({ args: bound }));

	const res = await getData({ args: manual });
	expect(res).toEqual(manual);

	const { getState, execute } = getData.mount();

	execute({ args: manual });
	await vi.waitFor(() => {
		expect(getState().data).toEqual(manual);
	});
});
