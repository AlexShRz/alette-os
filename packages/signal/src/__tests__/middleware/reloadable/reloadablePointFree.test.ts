import { as, factory, input, reloadable, runOnMount } from "../../../domain";
import { createTestApi } from "../../utils";

test("it uses deep equality argument in point-free mode", async () => {
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
		reloadable,
		factory(({ args }) => {
			ranTimes++;
			return args;
		}),
	).using(() => ({ args: ranTimes < 1 ? value1 : value2 }));

	const { getState, reload } = getData.mount();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(value1);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value1);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value2);
	});
});
