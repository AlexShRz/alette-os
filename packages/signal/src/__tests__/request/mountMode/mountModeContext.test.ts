import { path, factory } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it resets request context on next execution", async () => {
	const { custom } = createTestApi();
	const value = "asdasjkdh";
	const loggedPaths: string[] = [];

	const getData1 = custom(
		path((prev) => {
			/**
			 * Prev path should always be an empty string - ""
			 * */
			loggedPaths.push(prev as string);
			return "/heyy";
		}),
		factory(() => {
			return value;
		}),
	);

	const { when, execute } = getData1.mount();
	execute();
	await new Promise<void>((res) => {
		const unsubscribe = when(({ isSuccess }) => {
			if (isSuccess) {
				res();
				unsubscribe();
			}
		});
	});
	execute();

	await vi.waitFor(() => {
		expect(loggedPaths).toStrictEqual(["", ""]);
	});
});
