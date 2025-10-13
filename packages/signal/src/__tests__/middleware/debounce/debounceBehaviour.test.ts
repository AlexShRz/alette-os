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

test("it does not debounce run on mount behaviour", async () => {
	const { custom } = createTestApi();
	const returnValue = "asdasdasdas";

	const getData = custom(
		runOnMount(),
		reloadable(() => true),
		debounce(() => {
			return "10 seconds";
		}),
		factory(() => {
			return returnValue;
		}),
	);

	const { getState } = getData.mount();

	await vi.waitFor(async () => {
		expect(getState().data).toEqual(returnValue);
	});
});

/**
 * 1. Imagine we keep receiving new "search" property
 * from a React input component placed "above" the current component.
 * 2. This will trigger a reload that needs to be debounced.
 * */
test("it debounces request reloading", async () => {
	const { api, custom } = createTestApi();
	const returnValue = "asdasdasdas";
	let reloadableCalled = 0;

	const getData = custom(
		runOnMount(false),
		debounce(() => {
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

test("it allows users to skip debounce", async () => {
	const { custom } = createTestApi();
	const returnValue = "asdasdasdas";

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		debounce(() => {
			return "10 seconds";
		}),
		factory(() => {
			return returnValue;
		}),
	);

	vi.useFakeTimers();
	const { getState, execute } = getData.mount();
	execute({ skipDebounce: true });

	await vi.waitFor(async () => {
		expect(getState().data).toEqual(returnValue);
	});
});

test.fails(
	"it does not allow users to skip debounce if debounce flag is set to false",
	async () => {
		const { custom } = createTestApi();
		const returnValue = "asdasdasdas";

		const getData = custom(
			runOnMount(false),
			reloadable(() => true),
			debounce(() => {
				return "10 seconds";
			}),
			factory(() => {
				return returnValue;
			}),
		);

		vi.useFakeTimers();
		const { getState, execute } = getData.mount();
		execute({ skipDebounce: false });

		await vi.waitFor(async () => {
			expect(getState().data).toEqual(returnValue);
		});
	},
);

test.fails("it removes throttle middleware if encountered", async () => {
	const { custom } = createTestApi();
	const returnValue = "asdasdasdas";
	let reachedThrottle = false;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		throttle(() => {
			reachedThrottle = true;
			return "20 seconds";
		}),
		debounce(300),
		factory(() => {
			return returnValue;
		}),
	);

	const { execute } = getData.mount();
	execute();

	await vi.waitFor(async () => {
		expect(reachedThrottle).toBeTruthy();
	});
});
