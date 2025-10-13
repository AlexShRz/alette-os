import { vi } from "vitest";
import {
	debounce,
	factory,
	reloadable,
	runOnMount,
	throttle,
} from "../../../domain";
import { createTestApi } from "../../utils";

beforeEach(() => {
	vi.useRealTimers();
});

test("it does not throttle run on mount behaviour", async () => {
	const { custom } = createTestApi();
	const returnValue = "asdasdasdas";

	const getData = custom(
		runOnMount(),
		reloadable(() => true),
		throttle(() => {
			return "10 seconds";
		}),
		factory(() => {
			return returnValue;
		}),
	);

	vi.useFakeTimers();
	const { getState } = getData.mount();

	await vi.waitFor(async () => {
		expect(getState().data).toEqual(returnValue);
	});
});

/**
 * 1. Imagine we keep receiving new "search" property
 * from a React input component placed "above" the current component.
 * 2. This will trigger a reload that needs to be throttled.
 * */
test("it throttles request reloading", async () => {
	const { api, custom } = createTestApi();
	const returnValue = "asdasdasdas";
	let reloadableCalled = 0;

	const getData = custom(
		runOnMount(false),
		throttle(() => {
			return "10 seconds";
		}),
		reloadable(() => {
			reloadableCalled++;
			return true;
		}),
		factory(() => {
			return returnValue;
		}),
	);

	vi.useFakeTimers();
	const { reload } = getData.mount();
	reload();
	reload();
	reload();
	reload();

	await api.timeTravel("15 seconds");

	await vi.waitFor(async () => {
		expect(reloadableCalled).toEqual(1);
	});
});

test("it allows users to skip throttle", async () => {
	const { custom } = createTestApi();
	const returnValue = "asdasdasdas";

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		throttle(() => {
			return "10 seconds";
		}),
		factory(() => {
			return returnValue;
		}),
	);

	vi.useFakeTimers();
	const { getState, execute } = getData.mount();
	execute({ skipThrottle: true });

	await vi.waitFor(async () => {
		expect(getState().data).toEqual(returnValue);
	});
});

test.fails(
	"it does not allow users to skip throttle if throttle flag is set to false",
	async () => {
		const { custom } = createTestApi();
		const returnValue = "asdasdasdas";

		const getData = custom(
			runOnMount(false),
			reloadable(() => true),
			throttle(() => {
				return "10 seconds";
			}),
			factory(() => {
				return returnValue;
			}),
		);

		vi.useFakeTimers();
		const { getState, execute } = getData.mount();
		execute({ skipThrottle: false });

		await vi.waitFor(async () => {
			expect(getState().data).toEqual(returnValue);
		});
	},
);

test.fails("it removes debounce middleware if encountered", async () => {
	const { custom } = createTestApi();
	const returnValue = "asdasdasdas";
	let reachedDebounce = false;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		debounce(() => {
			reachedDebounce = true;
			return "20 seconds";
		}),
		throttle(300),
		factory(() => {
			return returnValue;
		}),
	);

	const { execute } = getData.mount();
	execute();

	await vi.waitFor(async () => {
		expect(reachedDebounce).toBeTruthy();
	});
});
