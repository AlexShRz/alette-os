import { BodyValidationError } from "@alette/pulse";
import {
	setContext,
	setErrorHandler,
	setLoggerConfig,
} from "../../../application";
import { path, body, factory } from "../../../domain";
import { createTestApi } from "../../utils/createTestApi";

test("it overrides previous middleware of the same type", async () => {
	const { custom } = createTestApi();
	const myBody = {};
	const expectedHeaders = {
		"Content-Type": "application/json;charset=UTF-8",
	};
	let returned: any = null;

	const getData = custom(
		body(new Blob()),
		body(myBody),
		factory(({ body, headers }) => {
			returned = [body, headers];
			return true;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(returned[0]).toStrictEqual(myBody);
		expect(returned[1]).toStrictEqual(expectedHeaders);
	});
});

test("it can access request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));
	const myResponse = "asda";

	let caughtContext: typeof context | null = null;
	let caughtPath: string | null = null;

	const pathValue = "/asdads";

	const getData = custom(
		path(pathValue),
		body(async ({ context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
			return new Blob();
		}),
		factory(() => {
			return myResponse;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
		expect(caughtPath).toBe(pathValue);
	});
});

test("it throws a fatal error if set body is incorrect", async () => {
	const { api, custom } = createTestApi();
	let failed = false;
	const myBody = 1312312;

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (
				error instanceof BodyValidationError &&
				error.getInvalidBody() === myBody
			) {
				failed = true;
			}
		}),
	);

	const getData = custom(
		// @ts-expect-error
		body(myBody),
		factory(() => {
			return true;
		}),
	);

	getData.execute().catch((e) => e);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});
