import * as S from "effect/Schema";
import { ResponseValidationError, responseAdapter } from "../../../domain";

const valueSchema = S.standardSchemaV1(
	S.Struct({
		key: S.String,
	}),
);

test("it serializes and deserializes response values", () => {
	const logged: number[] = [];
	const passedValue: typeof valueSchema.Type = { key: "asd" };

	const MyResponse = responseAdapter()
		.schema(valueSchema)
		.whenSerialized((value) => {
			logged.push(1);
			return JSON.stringify(value);
		})
		.build();
	const value = MyResponse.from(passedValue).serialize();

	expect(logged).toStrictEqual([1]);
	expect(MyResponse.fromSerialized(value).unsafeGet()).toStrictEqual(
		passedValue,
	);
});

test("it clones response values", () => {
	const passedValue: typeof valueSchema.Type = { key: "asd" };
	const cloned: typeof valueSchema.Type = { key: "cloneeeed" };

	const MyResponse = responseAdapter()
		.schema(valueSchema)
		.whenCloned(() => {
			return cloned;
		})
		.build();
	const response = MyResponse.from(passedValue);

	expect(response.clone().unsafeGet()).toStrictEqual(cloned);
});

test("it throws an error if response value does not match schema ", async () => {
	const MyResponse = responseAdapter().schema(valueSchema).build();

	expect(() => MyResponse.from("asdasdkjasdjkasnd")).toThrowError(
		ResponseValidationError,
	);
});

test("it clones clean values only", () => {
	const passedValue: typeof valueSchema.Type = { key: "asd" };
	const cloned: typeof valueSchema.Type = { key: "cloneeeed" };

	const MyResponse = responseAdapter()
		.schema(valueSchema)
		.whenCloned(() => {
			return cloned;
		})
		.build();

	const response = MyResponse.from(passedValue);
	expect(response.clone().unsafeGet()).toStrictEqual(cloned);

	const response2 = MyResponse.from(passedValue).markAsDirty();
	const value1 = response2.unsafeGet();
	const value2 = response2.clone().unsafeGet();
	/**
	 * References must stay the same
	 * */
	expect(value1 === value2).toBeTruthy();
});

test("it clones only clean values before mapping", async () => {
	const initial: typeof valueSchema.Type = { key: "asd" };
	const cloned: typeof valueSchema.Type = { key: "cloneeeed" };

	const MyResponse = responseAdapter()
		.schema(valueSchema)
		.whenCloned(() => {
			return { ...cloned };
		})
		.build();

	const response1 = MyResponse.from(initial);
	const response2 = MyResponse.from(initial).markAsDirty();
	const mappedResponse1 = (await response1.map(async (v) => v)).unsafeGet();
	const mappedResponse2 = (await response2.map(async (v) => v)).unsafeGet();

	expect(mappedResponse1).toStrictEqual(cloned);
	expect(mappedResponse2).toStrictEqual(initial);
});

test("it only clones clean values before mapping", async () => {
	const initial: typeof valueSchema.Type = { key: "asd" };
	const cloned: typeof valueSchema.Type = { key: "cloneeeed" };

	const MyResponse = responseAdapter()
		.schema(valueSchema)
		.whenCloned(() => {
			return { ...cloned };
		})
		.build();

	const response1 = MyResponse.from(initial);
	const response2 = MyResponse.from(initial).markAsDirty();
	const mappedResponse1 = (await response1.map(async (v) => v)).unsafeGet();
	const mappedResponse2 = (await response2.map(async (v) => v)).unsafeGet();

	expect(mappedResponse1).toStrictEqual(cloned);
	expect(mappedResponse2).toStrictEqual(initial);
});

test("it reuses dirty value for the whole chain of mappers", async () => {
	const expected = "hhhh";
	const initial: typeof valueSchema.Type = { key: "" };

	const MyResponse = responseAdapter()
		.schema(valueSchema)
		.whenCloned(() => {
			return { key: "aaaaaaa" };
		})
		.build();

	const response = MyResponse.from(initial).markAsDirty();
	await response.map(async ({ key: prevKey }) => ({ key: prevKey + "h" }));
	await response.map(async ({ key: prevKey }) => ({ key: prevKey + "h" }));
	await response.map(async ({ key: prevKey }) => ({ key: prevKey + "h" }));
	await response.map(async ({ key: prevKey }) => ({ key: prevKey + "h" }));

	expect(response.unsafeGet().key).toStrictEqual(expected);
});

test("it creates a new reference if mapped value does not match previous schema", async () => {
	const initial: typeof valueSchema.Type = { key: "" };

	const MyResponse = responseAdapter()
		.schema(valueSchema)
		.whenCloned(() => {
			return { key: "aaaaaaa" };
		})
		.build();

	const response = MyResponse.from(initial).markAsDirty();
	const mappedResponse1 = await response.map(async ({ key: prevKey }) => ({
		key: prevKey + "h",
	}));
	const mappedResponse2 = await response.map(async () => "hiThere");

	expect(response.getId() === mappedResponse1.getId()).toBeTruthy();
	expect(mappedResponse1.getId() !== mappedResponse2.getId()).toBeTruthy();
	/**
	 * 1. Newly created response must be marked as dirty.
	 * 2. This makes sure we do not clone it more than needed down
	 * the mapper chain.
	 * */
	expect(mappedResponse2.isDirty()).toBeTruthy();
});

test("it allows mapping into other adapters", async () => {
	const initial: typeof valueSchema.Type = { key: "" };
	const expected: typeof valueSchema.Type = { key: "hasdnasdknjasdkjndan" };

	const MyResponse1 = responseAdapter().schema(valueSchema).build();
	const MyResponse2 = responseAdapter().schema(valueSchema).build();

	const response = MyResponse1.from(initial);
	const newResponse = await response.map(async () =>
		MyResponse2.from(expected),
	);

	expect(response.getId() !== newResponse.getId()).toBeTruthy();
	expect(newResponse.unsafeGet()).toStrictEqual(expected);
});
