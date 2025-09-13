import { factory, input, reloadable, runOnMount, type } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it uses deep equality argument check by default", async () => {
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
		input(type<typeof value1>()),
		runOnMount(),
		reloadable(),
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

test("it can apply custom equality checks", async () => {
	const { custom } = createTestApi();
	const value1 = {
		heyy: 12312,
		mymy: "asdasd",
	};
	const value2: typeof value1 = {
		heyy: 12312,
		mymy: "sss",
	};
	let ranTimes = 0;
	let wasCancelled = true;
	let enteredMiddlewareTimes = 0;

	const getData = custom(
		input(type<typeof value1>()),
		runOnMount(),
		reloadable(({ prev, current }) => {
			enteredMiddlewareTimes++;
			if (!prev) {
				return true;
			}

			const canReload = prev.args.heyy !== current.args.heyy;

			if (!canReload) {
				wasCancelled = true;
			}

			return canReload;
		}),
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
		expect(getState().data).toEqual(value1);
	});
	reload();
	await vi.waitFor(() => {
		expect(wasCancelled).toBeTruthy();
		expect(enteredMiddlewareTimes).toBe(2);
	});
});

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
		input(type<typeof value>()),
		runOnMount(),
		reloadable(() => {
			enteredMiddlewareTimes++;
			return false;
		}),
		factory(({ args }) => {
			return args;
		}),
	);

	const res = await getData.execute({ args: value });

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
		input(type<typeof value1>()),
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
