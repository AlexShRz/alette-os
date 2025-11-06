import { credentials, factory } from "../../../domain";
import { createTestApi } from "../../utils";

test("it includes credentials in point-free mode", async () => {
	const { custom } = createTestApi();

	const getData = custom(
		credentials,
		factory(({ credentials }) => {
			return credentials;
		}),
	);

	expect(await getData()).toEqual("include");
});
