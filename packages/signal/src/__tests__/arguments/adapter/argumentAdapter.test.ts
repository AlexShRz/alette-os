import { Schema } from "effect";
import {
	ArgumentCloningError,
	RequestArgValidationError,
	argumentAdapter,
	type,
} from "../../../domain";

test("it compares equality", async () => {
	const obj = { hii: { there: false } };

	// Uses default deep equality
	const MyArgs1 = argumentAdapter().schema(type<typeof obj>()).build();
	// Uses custom equality
	const MyArgs2 = argumentAdapter()
		.schema(type<typeof obj>())
		.whenCompared((that) => {
			return !!that && that.hii.there;
		})
		.build();

	expect(MyArgs1.from(obj).isEqual(obj)).toBeTruthy();
	expect(MyArgs2.from(obj).isEqual(obj)).toBeFalsy();
});

test("it throws if arguments are not compatible with the schema", async () => {
	const MyArgs = argumentAdapter()
		.schema(Schema.standardSchemaV1(Schema.Literal("hiii")))
		.build();

	expect(() => MyArgs.from("ssddssdsds")).toThrowError(
		RequestArgValidationError,
	);
	MyArgs.from("hiii");
});

test("it clones arguments", () => {
	const obj1 = { hii: { hii: "asdasdas" } };
	const obj2 = { hii: { hii: "sss" } };

	const MyArgs1 = argumentAdapter().schema(type<typeof obj1>()).build();
	const MyArgs2 = argumentAdapter()
		.schema(type<typeof obj1>())
		.whenCloned(() => {
			return obj2;
		})
		.build();

	expect(MyArgs1.from(obj1).clone().get()).toStrictEqual(obj1);
	expect(MyArgs2.from(obj1).clone().get()).toStrictEqual(obj2);
});

test("it throws an error if default clone algorithm cannot clone arguments", () => {
	class Test {}

	/**
	 * Non serializable args
	 * */
	const obj = { sadasd: { hii: () => {}, sss: new Test() } };

	const MyArgs = argumentAdapter().schema(type<typeof obj>()).build();

	expect(() => MyArgs.from(obj).clone()).toThrowError(ArgumentCloningError);
});

test("it can override set arguments", () => {
	const obj1 = { hii: "3424234" };
	const obj2 = { hii: "333333333333" };

	const MyArgs = argumentAdapter().schema(type<typeof obj1>()).build();
	const args = MyArgs.from(obj1);

	expect(args.get()).toStrictEqual(obj1);

	args.set(obj2);
	expect(args.get()).toStrictEqual(obj2);
});

test("it throws an error during arg override if arg type is not compatible", () => {
	const MyArgs = argumentAdapter()
		.schema(Schema.standardSchemaV1(Schema.Literal("ssss")))
		.build();
	const args = MyArgs.from("ssss");

	expect(() => args.set("asdaksbdkasdbaksjdbaskjb")).toThrowError(
		RequestArgValidationError,
	);
});
