import { type } from "@alette/pulse";
import { Schema } from "effect";
import {
	setContext,
	setErrorHandler,
	setLoggerConfig,
} from "../../application";
import { TokenCredentialValidationError } from "../../domain";
import { createTestApi } from "../utils";

test("it sets credentials", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	const myCredentials = "234324";
	const logged: string[] = [];

	const myToken = token()
		.credentials(type<string>())
		.from(async ({ getCredentialsOrThrow }) => {
			logged.push(await getCredentialsOrThrow());
			return tokenValue;
		})
		.build()
		.using(myCredentials);

	const value = await myToken.get();

	expect(value).toEqual(tokenValue);
	expect(logged[0]).toEqual(myCredentials);
});

test("it can access previous credentials before updating them", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	const prevCredentials = "234324";
	const myCredentials = "askdnasjkdnaskdn";
	const expected = `${prevCredentials}${myCredentials}`;
	const logged: string[] = [];

	const myToken = token()
		.credentials(type<string>())
		.from(async ({ getCredentialsOrThrow }) => {
			logged.push(await getCredentialsOrThrow());
			return tokenValue;
		})
		.build()
		.using(prevCredentials);

	myToken.using(async ({ previous }) => {
		if (!previous) {
			return myCredentials;
		}

		return `${previous}${myCredentials}`;
	});
	const value = await myToken.get();

	await vi.waitFor(() => {
		expect(value).toEqual(tokenValue);
		expect(logged[0]).toEqual(expected);
	});
});

test("it throws a fatal error if credentials do not match schema", async () => {
	const { api, token } = createTestApi();
	let failed = false;
	const myInvalidCredentials = 1312312;

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (
				error instanceof TokenCredentialValidationError &&
				error.getInvalidCredentials() === myInvalidCredentials
			) {
				failed = true;
			}
		}),
	);

	token()
		.credentials(Schema.standardSchemaV1(Schema.Literal("hellooooo")))
		.from(async () => {
			return "asdasd";
		})
		.build()
		// @ts-expect-error
		.using(myInvalidCredentials);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});

test("it can access global context", async () => {
	const { api, token } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));

	let caughtContext: typeof context | null = null;

	const myToken = token()
		.credentials(type<string>())
		.from(() => {
			return "asdads";
		})
		.build()
		.using(({ context }) => {
			caughtContext = context as any;
			return "asda";
		});

	await myToken.get();
	expect(caughtContext).toEqual(context);
});
