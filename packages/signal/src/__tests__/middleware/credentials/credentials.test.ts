import { credentials, factory } from "../../../domain";
import { createTestApi } from "../../utils";

test("it includes credentials by default if nothing was passed", async () => {
	const { custom } = createTestApi();

	const getData = custom(
		credentials(),
		factory(({ credentials }) => {
			return credentials;
		}),
	);

	expect(await getData()).toEqual("include");
});

test.each([["include" as const], ["omit" as const], ["same-origin" as const]])(
	"it uses provided credential type if available",
	async (credentialType) => {
		const { custom } = createTestApi();

		const getData = custom(
			credentials(credentialType),
			factory(({ credentials }) => {
				return credentials;
			}),
		);

		expect(await getData()).toEqual(credentialType);
	},
);

test("it overrides middleware of the same type", async () => {
	const { custom } = createTestApi();

	const getData = custom(
		credentials(),
		credentials("omit"),
		credentials("same-origin"),
		factory(({ credentials }) => {
			return credentials;
		}),
	);

	expect(await getData()).toEqual("same-origin");
});
