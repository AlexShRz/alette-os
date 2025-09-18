import { expect } from "@effect/vitest";
import { deactivatePlugins } from "../../application";
import { factory, input, type } from "../../domain";
import { RequestInterruptedError } from "../../shared/error/RequestInterruptedError";
import { createTestApi } from "../../shared/testUtils/createTestApi";

test("it overrides previous request when a new request command is received", async () => {
	const { custom } = createTestApi();
	const value1 = "asdasjkdh";
	const value2 = "3434sadasd";
	let ran = 0;

	const getData1 = custom(
		input(type<string>()),
		factory(async ({ args }) => {
			ran++;

			if (ran === 1) {
				return await new Promise<string>(() => {
					// Do not resolve anything
				});
			}

			return await new Promise<string>((res) => {
				res(args);
			});
		}),
	);

	const { execute, getState } = getData1.mount();
	execute({ args: value1 });
	await vi.waitFor(() => {
		expect(getState().isLoading).toBeTruthy();
	});

	execute({ args: value2 });
	await vi.waitFor(() => {
		expect(getState().data).toEqual(value2);
	});
});

test("it interrupts plugin requests if the plugin is deactivated", async () => {
	const { api, custom, corePlugin } = createTestApi();
	let requestWasInterrupted = false;
	let isLoading = false;

	const getData1 = custom(
		factory(async () => {
			return await new Promise<string>(() => {
				// Do not resolve anything
			});
		}),
	);
	const getData2 = custom(
		factory(async () => {
			isLoading = true;
			return await new Promise<string>(() => {
				// Do not resolve anything
			});
		}),
	);

	const { execute, getState } = getData1.mount();
	execute();

	getData2.execute().catch((e) => {
		/**
		 * All in progress requests must be shutdown
		 * */
		if (e instanceof RequestInterruptedError) {
			requestWasInterrupted = true;
		}
	});

	await vi.waitFor(() => {
		expect(getState().isLoading).toBeTruthy();
		expect(isLoading).toBeTruthy();
	});

	api.tell(deactivatePlugins(corePlugin));
	await vi.waitFor(() => {
		const error = getState().error;
		expect(error instanceof RequestInterruptedError).toBeTruthy();
		expect(requestWasInterrupted).toBeTruthy();
	});
});
