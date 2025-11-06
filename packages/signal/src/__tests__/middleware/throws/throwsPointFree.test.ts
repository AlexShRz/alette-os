import { RequestFailedError, factory, throws } from "../../../domain";
import { createTestApi } from "../../utils";

test("it registers default errors in point-free mode", async () => {
	const { custom } = createTestApi();

	const getData = custom(
		throws,
		factory(() => {
			throw new RequestFailedError();
		}),
	);

	await expect(async () => getData()).rejects.toBeInstanceOf(
		RequestFailedError,
	);
});
