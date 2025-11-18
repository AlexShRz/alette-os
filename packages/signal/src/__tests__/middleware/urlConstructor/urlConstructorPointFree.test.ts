import { url } from "../../../domain";
import { MiddlewareWasNotInitializedError } from "../../../domain/middleware";
import { createTestApi } from "../../utils";

test("it throws an error in point-free mode", async () => {
	const { custom } = createTestApi();

	const getData = custom(url);

	await expect(async () => getData()).rejects.toBeInstanceOf(
		MiddlewareWasNotInitializedError,
	);
});
