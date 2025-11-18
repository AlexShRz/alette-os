import { abortedBy, factory } from "../../../domain";
import { MiddlewareWasNotInitializedError } from "../../../domain/middleware";
import { createTestApi } from "../../utils";

test("it throws an error in point-free mode", async () => {
	const { custom } = createTestApi();

	const getData1 = custom(
		abortedBy,
		factory(() => {
			// never resolve
			return new Promise(() => {});
		}),
	);

	await expect(async () => getData1()).rejects.toBeInstanceOf(
		MiddlewareWasNotInitializedError,
	);
});
