import { path, factory, output, type } from "../../domain";
import { createTestApi } from "../../shared/testUtils/createTestApi";

test("it executes simple requests", async () => {
	const { custom } = createTestApi();
	const value = "asdasjkdh";

	const getData = custom(
		// input(type<string>()),
		output(type<string>()),
		path("/hey"),
		factory(() => {
			return value;
		}),
	);

	const response = await getData.execute();
	expect(response).toEqual(value);
});
