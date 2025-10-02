import { vi } from "vitest";
import { setContext } from "../../../application";
import {
	debounce,
	factory,
	input,
	reloadable,
	runOnMount,
	type,
} from "../../../domain";
import { IRequestContext } from "../../../domain/context/IRequestContext";
import { WithCurrentRequestOverride } from "../../../domain/execution/events/envelope/WithCurrentRequestOverride";
import { MiddlewarePriority } from "../../../domain/middleware/MiddlewarePriority";
import { activityLens, createTestApi } from "../../utils";

beforeEach(() => {
	vi.useRealTimers();
});

export const tapOnDebounce = <C extends IRequestContext>(fn: () => void) =>
	activityLens<C>((event) => {
		if (event instanceof WithCurrentRequestOverride && event.isCancelled()) {
			fn();
		}
	}, MiddlewarePriority.Creation);

test("it delays requests execution until after a period of inactivity has elapsed", async () => {
	const { api, custom } = createTestApi();
	const returnValue = "asdasdasdas";
	let debounceReached = false;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		debounce(() => {
			return "10 seconds";
		}),
		tapOnDebounce(() => {
			debounceReached = true;
		}),
		factory(() => {
			return returnValue;
		}),
	);

	const { getState, execute } = getData.mount();
	vi.useFakeTimers();
	execute();

	await vi.waitFor(() => {
		expect(debounceReached).toBeTruthy();
	});

	await api.timeTravel("20 seconds");

	await vi.waitFor(async () => {
		expect(getState().data).toEqual(returnValue);
	});
});

test("it uses last known setting supplier to execute the request", async () => {
	const { api, custom } = createTestApi();
	const myArgs = "214123412asdasd";
	let debounceReached = false;
	let reachedFactory = 0;

	const getData = custom(
		input(type<string>()),
		runOnMount(false),
		reloadable(() => true),
		debounce(() => {
			return "10 seconds";
		}),
		tapOnDebounce(() => {
			debounceReached = true;
		}),
		factory(({ args }) => {
			reachedFactory++;
			return args;
		}),
	);

	const { getState, execute } = getData.mount();
	vi.useFakeTimers();
	execute({ args: "assss" });
	execute({ args: "234234" });
	execute({ args: "asdasqsadasdasd" });
	execute({ args: "heyy" });
	execute({ args: myArgs });

	await vi.waitFor(() => {
		expect(debounceReached).toBeTruthy();
	});

	await api.timeTravel("20 seconds");

	await vi.waitFor(async () => {
		expect(getState().data).toEqual(myArgs);
		expect(reachedFactory).toEqual(1);
	});
});

test("it does not debounce requests in one shot mode", async () => {
	const { custom } = createTestApi();
	const response = "asdasdasd";

	const getData = custom(
		debounce("30 seconds"),
		factory(() => {
			return response;
		}),
	);

	const responses = await Promise.all([
		getData.execute(),
		getData.execute(),
		getData.execute(),
		getData.execute(),
		getData.execute(),
		getData.execute(),
	]);
	expect(responses.every((res) => res === response)).toBeTruthy();
});

test("it can access request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));

	let caughtContext: typeof context | null = null;

	const getData = custom(
		debounce(({ context }) => {
			caughtContext = context as any;
			return 100;
		}),
		factory(() => {
			return "asd";
		}),
	);

	const { execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
	});
});

test("it overrides middleware of the same type", async () => {
	const { custom } = createTestApi();
	const returnValue = "asdasdasdas";
	let reachedDebounce = 0;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		debounce(() => {
			reachedDebounce++;
			return 10;
		}),
		debounce(() => {
			reachedDebounce++;
			return 100;
		}),
		factory(() => {
			return returnValue;
		}),
	);

	const { execute } = getData.mount();
	execute();

	await vi.waitFor(async () => {
		expect(reachedDebounce).toEqual(1);
	});
});
