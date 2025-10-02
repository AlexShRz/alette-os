import { Schema } from "effect";
import { setErrorHandler, setLoggerConfig } from "../../application";
import {
	ArgumentValidationError,
	argumentAdapter,
	factory,
	input,
} from "../../domain";
import { createTestApi } from "../utils/createTestApi";

test("it throws a fatal error if arguments do not match schema", async () => {
	const { api, custom } = createTestApi();
	let failed = false;
	const invalidArgs = "asdasdas";

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (
				error instanceof ArgumentValidationError &&
				error.getInvalidArgs() === invalidArgs
			) {
				failed = true;
			}
		}),
	);

	const MyArgs = Schema.standardSchemaV1(
		Schema.Struct({
			hey: Schema.String,
		}),
	);

	const getData = custom(
		input(MyArgs),
		factory(() => {
			return "asads";
		}),
	);

	// @ts-expect-error
	getData.execute({ args: invalidArgs }).catch((e) => e);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});

test("it throws a fatal error if arguments do not match schema (with argument adapter)", async () => {
	const { api, custom } = createTestApi();
	let failed = false;
	const invalidArgs = "asdasdas";

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (
				error instanceof ArgumentValidationError &&
				error.getInvalidArgs() === invalidArgs
			) {
				failed = true;
			}
		}),
	);

	const MyArgs = argumentAdapter()
		.schema(
			Schema.standardSchemaV1(
				Schema.Struct({
					hey: Schema.String,
				}),
			),
		)
		.build();

	const getData = custom(
		input(MyArgs),
		factory(() => {
			return "asads";
		}),
	);

	// @ts-expect-error
	getData.execute({ args: invalidArgs }).catch((e) => e);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});

test("it overrides middleware of the same type", async () => {
	const { custom } = createTestApi();
	const argValue = "hello";

	const MyArgs1 = Schema.standardSchemaV1(
		Schema.Struct({
			hey: Schema.String,
		}),
	);

	const MyArgs2 = Schema.standardSchemaV1(Schema.Literal("hello"));

	const getData = custom(
		input(MyArgs1),
		input(MyArgs2),
		factory(({ args }) => {
			return args;
		}),
	);

	const response = await getData.execute({ args: argValue });

	await vi.waitFor(() => {
		expect(response).toEqual(argValue);
	});
});
