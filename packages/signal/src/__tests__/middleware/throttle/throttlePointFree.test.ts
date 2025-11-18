import { vi } from "vitest";
import {
	as,
	factory,
	input,
	reloadable,
	runOnMount,
	throttle,
} from "../../../domain";
import { createTestApi } from "../../utils";
import { tapOnThrottle } from "./throttle.test";

test("it uses default delay in point-free mode", async () => {
	const { api, custom } = createTestApi();
	const myArgs = "asdasdasdas";
	let throttleReached = false;
	let reachedFactory = 0;

	const getData = custom(
		input(as<string>()),
		runOnMount(false),
		reloadable(() => true),
		throttle,
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

	await api.timeTravel("100 millis");
	await vi.waitFor(async () => {
		expect(getState().data).not.toEqual(myArgs);
	});

	await api.timeTravel("400 millis");
	await vi.waitFor(async () => {
		expect(getState().data).toEqual(myArgs);
		expect(reachedFactory).toEqual(1);
	});
});
