import { as, factory, input, reloadable, runOnMount } from "../../../domain";
import { createTestApi } from "../../utils/createTestApi";

test("it disables the check during one shot requests", async () => {
	const { custom } = createTestApi();
	let enteredMiddlewareTimes = 0;
	const value = {
		heyy: 12312,
		mymy: {
			heyy: "asdasd",
		},
	};

	const getData = custom(
		input(as<typeof value>()),
		runOnMount(),
		reloadable(() => {
			enteredMiddlewareTimes++;
			return false;
		}),
		factory(({ args }) => {
			return args;
		}),
	);

	const res = await getData({ args: value });

	await vi.waitFor(() => {
		expect(res).toEqual(value);
		expect(enteredMiddlewareTimes).toEqual(0);
	});
});

test("it overrides previous middleware of the same type", async () => {
	const { custom } = createTestApi();
	const value1 = {
		heyy: 12312,
		mymy: {
			heyy: "asdasd",
		},
	};
	const value2: typeof value1 = {
		heyy: 12312,
		mymy: {
			heyy: "sss",
		},
	};
	let ranTimes = 0;

	const getData = custom(
		input(as<typeof value1>()),
		runOnMount(),
		reloadable(() => false),
		reloadable(),
		factory(({ args }) => {
			ranTimes++;
			return args;
		}),
	).using(() => ({ args: !ranTimes ? value1 : value2 }));

	const { getState, reload } = getData.mount();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(value1);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value2);
	});
});
