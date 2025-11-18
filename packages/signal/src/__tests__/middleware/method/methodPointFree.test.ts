import { factory, method } from "../../../domain";
import { createTestApi } from "../../utils";

test("it uses the 'GET' method in point-free mode", async () => {
	const { custom } = createTestApi();
	const expected = "GET" as const;

	const getData = custom(
		method,
		factory(({ method }) => {
			return method;
		}),
	);

	const res = await getData();
	await vi.waitFor(() => {
		expect(res).toBe(expected);
	});
});
