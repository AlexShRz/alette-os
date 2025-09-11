import { expect } from "@effect/vitest";
import { factory } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test.fails("it does not process new requests after unmount", async () => {
	const { custom } = createTestApi();
	const value = "asdasdas";

	const getData1 = custom(
		factory(() => {
			return value;
		}),
	);

	const { execute, unmount, getState } = getData1.mount();

	unmount();
	execute();
	execute();
	execute();
	execute();
	await vi.waitFor(
		() => {
			expect(getState().data).toEqual(value);
		},
		{ timeout: 1000 },
	);
});
