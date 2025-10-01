import { Schema } from "effect";
import { setErrorHandler } from "../../application";
import {
	ResponseValidationError,
	factory,
	output,
	responseAdapter,
} from "../../domain";
import { createTestApi } from "../../shared/testUtils/createTestApi";

test("it throws a fatal error if response does not match schema", async () => {
	const { api, custom } = createTestApi();
	let failed = false;
	const invalidResponse = "asdasdas";

	api.tell(
		setErrorHandler((error) => {
			if (
				error instanceof ResponseValidationError &&
				error.getInvalidResponse() === invalidResponse
			) {
				failed = true;
			}
		}),
	);

	const MyOutput = Schema.standardSchemaV1(
		Schema.Struct({
			hey: Schema.String,
		}),
	);

	const getData = custom(
		output(MyOutput),
		factory(() => {
			return invalidResponse;
		}),
	);

	getData.execute().catch((e) => e);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});

test("it throws a fatal error if response does not match schema (with adapter)", async () => {
	const { api, custom } = createTestApi();
	let failed = false;
	const invalidResponse = "asdasdas";

	api.tell(
		setErrorHandler((error) => {
			if (
				error instanceof ResponseValidationError &&
				error.getInvalidResponse() === invalidResponse
			) {
				failed = true;
			}
		}),
	);

	const MyOutput = responseAdapter()
		.schema(
			Schema.standardSchemaV1(
				Schema.Struct({
					hey: Schema.String,
				}),
			),
		)
		.build();

	const getData = custom(
		output(MyOutput),
		factory(() => {
			return invalidResponse;
		}),
	);

	getData.execute().catch((e) => e);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});

test("it overrides middleware of the same type", async () => {
	const { custom } = createTestApi();
	const response = "hi" as const;

	const MyOutput1 = Schema.standardSchemaV1(
		Schema.Struct({
			hey: Schema.String,
		}),
	);
	const MyOutput2 = Schema.standardSchemaV1(Schema.Literal("hi"));

	const getData = custom(
		output(MyOutput1),
		output(MyOutput2),
		factory(() => {
			return response;
		}),
	);

	const res = await getData.execute();

	await vi.waitFor(() => {
		expect(res).toEqual(response);
	});
});
