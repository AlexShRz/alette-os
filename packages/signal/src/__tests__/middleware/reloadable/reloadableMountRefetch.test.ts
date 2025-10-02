import { factory, input, reloadable, runOnMount, type } from "../../../domain";
import { createTestApi } from "../../utils/createTestApi";

/**
 * 1. First reload acts as a "mount" action, not "refetch"
 * 2. This means that reloadable must not activate until next refetch
 * 3. Next refetch will act as "refetch" action.
 * */
test("it does not run checks on first reload if run on mount is enabled", async () => {
	const { custom } = createTestApi();
	let enteredMiddlewareTimes = 0;
	const value = "asdasd";

	const getData = custom(
		input(type<typeof value>()),
		runOnMount(),
		reloadable(() => {
			enteredMiddlewareTimes++;
			return true;
		}),
		factory(({ args }) => {
			return args;
		}),
	).using(() => ({ args: value }));

	/**
	 * First reload must run automatically because
	 * runOnMount is on
	 * */
	const { getState, reload } = getData.mount();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(value);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value);
		expect(enteredMiddlewareTimes).toEqual(2);
	});
});

/**
 * 1. First reload when run on mount is disabled acts
 * as a "refetch" action, not "mount".
 * 2. When run on mount is disabled, it means that there are no
 * "mount" actions whatsoever. If we do a reload, it means
 * that probably some args have been changed, and we need to
 * reload (useEffect, etc.).
 * */
test("it runs checks on first reload if run on mount is disabled", async () => {
	const { custom } = createTestApi();
	let enteredMiddlewareTimes = 0;
	const value = "asda";

	const getData = custom(
		input(type<typeof value>()),
		runOnMount(false),
		reloadable(() => {
			enteredMiddlewareTimes++;
			return true;
		}),
		factory(({ args }) => {
			return args;
		}),
	).using(() => ({ args: value }));

	const { getState, reload } = getData.mount();

	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value);
	});
	reload();
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value);
		expect(enteredMiddlewareTimes).toEqual(2);
	});
});
