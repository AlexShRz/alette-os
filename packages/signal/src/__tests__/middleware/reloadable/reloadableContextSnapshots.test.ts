import { as, factory, input, reloadable, runOnMount } from "../../../domain";
import { createTestApi } from "../../utils/createTestApi";

test("it updates last context snapshot after each reload", async () => {
	const { custom } = createTestApi();
	const value1 = "asdasd";
	const value2 = "ssss";
	const value3 = "sdsdss";
	let last: any = undefined;
	let ranTimes = 0;

	const getData = custom(
		input(as<string>()),
		runOnMount(false),
		reloadable(async ({ prev }) => {
			last = prev?.args || null;
			return true;
		}),
		factory(({ args }) => {
			ranTimes++;
			return args;
		}),
	).using(() => {
		switch (ranTimes) {
			case 1:
				return { args: value2 };
			case 2:
				return { args: value3 };
			case 3:
				return { args: value3 };
			default:
				return { args: value1 };
		}
	});

	const { getState, reload } = getData.mount();

	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value1);
		expect(last).toEqual(null);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value2);
		expect(last).toEqual(value1);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value3);
		expect(last).toEqual(value2);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value3);
		expect(last).toEqual(value3);
	});
});

test("it saves context snapshot for next comparison only if the predicate succeeds", async () => {
	const { custom } = createTestApi();
	const value1 = "asdasd";
	const value2 = "ssss";
	const value3 = "sdsdss";
	let last: any = undefined;
	let ranTimes = 0;

	const getData = custom(
		input(as<string>()),
		runOnMount(false),
		reloadable(({ prev }) => {
			last = prev?.args || null;
			const canPass = ranTimes > 0;

			// Move on to next state manually
			if (!canPass) {
				ranTimes++;
			}

			return canPass;
		}),
		factory(({ args }) => {
			ranTimes++;
			return args;
		}),
	).using(() => {
		switch (ranTimes) {
			case 1:
				return { args: value2 };
			case 2:
				return { args: value3 };
			case 3:
				return { args: value3 };
			default:
				return { args: value1 };
		}
	});

	const { getState, reload } = getData.mount();

	// Fails
	reload();
	await vi.waitFor(() => {
		expect(last).toEqual(null);
	});
	// Succeeds
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value2);
		expect(last).toEqual(null);
	});
	// Succeeds
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value3);
		expect(last).toEqual(value2);
	});
	// Succeeds
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value3);
		expect(last).toEqual(value3);
	});
});
