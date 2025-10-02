import { vi } from "vitest";
import { setContext } from "../../../application";
import {
	factory,
	input,
	reloadable,
	runOnMount,
	throttle,
	type,
} from "../../../domain";
import { IRequestContext } from "../../../domain/context/IRequestContext";
import { WithCurrentRequestOverride } from "../../../domain/execution/events/envelope/WithCurrentRequestOverride";
import { MiddlewarePriority } from "../../../domain/middleware/MiddlewarePriority";
import { activityLens, createTestApi } from "../../utils";

beforeEach(() => {
	vi.useRealTimers();
});

export const tapOnThrottle = <C extends IRequestContext>(fn: () => void) =>
	activityLens<C>((event) => {
		if (event instanceof WithCurrentRequestOverride && event.isCancelled()) {
			fn();
		}
	}, MiddlewarePriority.Creation);

test("it captures first request command and executes it, while cancelling all that have arrived after capture", async () => {
	const { api, custom } = createTestApi();
	const myArgs = "asdasdasdas";
	let throttleReached = false;
	let reachedFactory = 0;

	const getData = custom(
		input(type<string>()),
		runOnMount(false),
		reloadable(() => true),
		throttle(() => {
			return "10 seconds";
		}),
		tapOnThrottle(() => {
			throttleReached = true;
		}),
		factory(({ args }) => {
			reachedFactory++;
			return args;
		}),
	);

	const { getState, execute } = getData.mount();
	vi.useFakeTimers();
	execute({ args: myArgs });
	execute({ args: "3434" });
	execute({ args: "234" });
	execute({ args: "234" });
	execute({ args: "asd" });

	await vi.waitFor(() => {
		expect(throttleReached).toBeTruthy();
	});

	await api.timeTravel("20 seconds");

	await vi.waitFor(async () => {
		expect(getState().data).toEqual(myArgs);
		expect(reachedFactory).toEqual(1);
	});
});

test("it can access request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));

	let caughtContext: typeof context | null = null;

	const getData = custom(
		throttle(({ context }) => {
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

test("it does not throttle requests in one shot mode", async () => {
	const { custom } = createTestApi();
	const response = "asdasdasd";

	const getData = custom(
		throttle("30 seconds"),
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
		throttle(({ context }) => {
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
	let reachedThrottle = 0;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		throttle(() => {
			reachedThrottle++;
			return 10;
		}),
		throttle(() => {
			reachedThrottle++;
			return 100;
		}),
		factory(() => {
			return returnValue;
		}),
	);

	const { execute } = getData.mount();
	execute();

	await vi.waitFor(async () => {
		expect(reachedThrottle).toEqual(1);
	});
});
