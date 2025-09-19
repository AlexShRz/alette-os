import { MethodValidationError, THttpMethod } from "@alette/pulse";
import { setContext, setErrorHandler } from "../../application";
import {
	path,
	deletes,
	factory,
	gets,
	method,
	patches,
	posts,
	puts,
} from "../../domain";
import { createTestApi } from "../../shared/testUtils/createTestApi";

test.each([
	["GET" as THttpMethod],
	["PUT" as THttpMethod],
	["POST" as THttpMethod],
	["PATCH" as THttpMethod],
	["HEAD" as THttpMethod],
	["DELETE" as THttpMethod],
	["OPTIONS" as THttpMethod],
])("it sets '%s' method", async (passedMethod: THttpMethod) => {
	const { custom } = createTestApi();

	const getData = custom(
		method(passedMethod),
		factory(({ method }) => {
			return method;
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toEqual(passedMethod);
	});
});

test("it can access request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));

	let caughtContext: typeof context | null = null;
	let caughtPath: string | null = null;

	const pathValue = "/asdads";

	const getData = custom(
		path(pathValue),
		method(async ({ context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
			return "PUT" as const;
		}),
		factory(() => {
			return true;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
		expect(caughtPath).toBe(pathValue);
	});
});

test("it overrides prev middleware of the same type", async () => {
	const { custom } = createTestApi();
	const expected = "PATCH" as const;

	const getData = custom(
		method(() => "POST"),
		method(async () => "GET" as const),
		method(expected),
		factory(({ method }) => {
			return method;
		}),
	);

	const res = await getData.execute();
	await vi.waitFor(() => {
		expect(res).toBe(expected);
	});
});

test("it throws a fatal error if the path is incorrect", async () => {
	const { api, custom } = createTestApi();
	let failed = false;
	const invalidMethod = "asdasdasd";

	api.tell(
		setErrorHandler((error) => {
			if (
				error instanceof MethodValidationError &&
				error.getInvalidMethod() === invalidMethod
			) {
				failed = true;
			}
		}),
	);

	const getData = custom(
		// @ts-expect-error
		method(invalidMethod),
		factory(() => {
			return true;
		}),
	);

	getData.execute().catch((e) => e);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});

test.each([
	[gets, "GET" as THttpMethod],
	[puts, "PUT" as THttpMethod],
	[posts, "POST" as THttpMethod],
	[patches, "PATCH" as THttpMethod],
	[deletes, "DELETE" as THttpMethod],
])(
	"it sets methods using the helper middleware",
	async (
		middleware:
			| typeof posts
			| typeof puts
			| typeof patches
			| typeof gets
			| typeof deletes,
		passedMethod: THttpMethod,
	) => {
		const { custom } = createTestApi();

		const getData = custom(
			middleware(),
			factory(({ method }) => {
				return method;
			}),
		);

		const result = await getData.execute();

		await vi.waitFor(() => {
			expect(result).toEqual(passedMethod);
		});
	},
);
