import {
	argumentAdapter,
	factory,
	input,
	reloadable,
	runOnMount,
	type,
} from "../../../domain";
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

test("it switches to custom arg adapter equality check if provided", async () => {
	const { custom } = createTestApi();
	let ranEqualityCheckTimes = 0;
	const value1 = "asdasd";
	const value2 = "ssssshjbjbj";

	const MyArgs = argumentAdapter()
		.schema(type<string>())
		.whenCompared(() => {
			const canPass = ranEqualityCheckTimes > 1;
			ranEqualityCheckTimes++;
			return canPass;
		})
		.build();

	let ranTimes = 0;

	const getData = custom(
		input(MyArgs),
		reloadable(),
		runOnMount(false),
		factory(({ args }) => {
			ranTimes++;
			return args;
		}),
	).using(() => ({ args: ranTimes < 1 ? value1 : value2 }));

	const { getState, reload } = getData.mount();

	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value1);
		expect(ranEqualityCheckTimes).toEqual(1);
	});
	reload();
	/**
	 * The adapter should be triggered from this
	 * point on.
	 * */
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value2);
		expect(ranEqualityCheckTimes).toEqual(2);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value2);
		expect(ranEqualityCheckTimes).toEqual(3);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value2);
		expect(ranEqualityCheckTimes).toEqual(4);
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
