import { path, factory, input, output, type } from "../../domain";
import { createTestApi } from "../../shared/testUtils/createTestApi";

/**
 * Just a simple sanity check
 * */
test("it executes requests", async () => {
	const { custom } = createTestApi();
	const value = "asdasjkdh";

	const getData = custom(
		input(type<string>()),
		output(type<string>()),
		path("/hey"),
		factory(() => {
			return value;
		}),
	);

	const response = await getData.execute();
	expect(response).toEqual(value);
});
