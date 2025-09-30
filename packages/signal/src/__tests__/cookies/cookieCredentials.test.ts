import { type } from "@alette/pulse";
import { Schema } from "effect";
import { setContext, setErrorHandler } from "../../application";
import { CookieCredentialValidationError } from "../../domain";
import { createTestApi } from "../../shared/testUtils";

test("it sets credentials", async () => {
	const { cookie } = createTestApi();
	const myCredentials = "234324";
	const logged: string[] = [];

	const myCookie = cookie()
		.credentials(type<string>())
		.from(async ({ getCredentialsOrThrow }) => {
			logged.push(await getCredentialsOrThrow());
		})
		.build()
		.using(myCredentials);

	await myCookie.load();

	expect(logged[0]).toEqual(myCredentials);
});

test("it can access previous credentials before updating them", async () => {
	const { cookie } = createTestApi();
	const prevCredentials = "234324";
	const myCredentials = "askdnasjkdnaskdn";
	const expected = `${prevCredentials}${myCredentials}`;
	const logged: string[] = [];

	const myCookie = cookie()
		.credentials(type<string>())
		.from(async ({ getCredentialsOrThrow }) => {
			logged.push(await getCredentialsOrThrow());
		})
		.build()
		.using(prevCredentials);

	myCookie.using(async ({ previous }) => {
		if (!previous) {
			return myCredentials;
		}

		return `${previous}${myCredentials}`;
	});
	await myCookie.load();

	await vi.waitFor(() => {
		expect(logged[0]).toEqual(expected);
	});
});

test("it throws a fatal error if credentials do not match schema", async () => {
	const { api, cookie } = createTestApi();
	let failed = false;
	const myInvalidCredentials = 1312312;

	api.tell(
		setErrorHandler((error) => {
			if (
				error instanceof CookieCredentialValidationError &&
				error.getInvalidCredentials() === myInvalidCredentials
			) {
				failed = true;
			}
		}),
	);

	cookie()
		.credentials(Schema.standardSchemaV1(Schema.Literal("hellooooo")))
		.from(async () => {})
		.build()
		// @ts-expect-error
		.using(myInvalidCredentials);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});

test("it can access global context", async () => {
	const { api, cookie } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));

	let caughtContext: typeof context | null = null;

	const myCookie = cookie()
		.credentials(type<string>())
		.from(() => {})
		.build()
		.using(({ context }) => {
			caughtContext = context as any;
			return "asda";
		});

	await myCookie.load();
	expect(caughtContext).toEqual(context);
});
