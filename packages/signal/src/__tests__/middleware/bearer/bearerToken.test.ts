import { RequestFailedError } from "@alette/pulse";
import { bearer, factory, headers } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils";

test("it marks token as invalid if the request fails with unauthenticated status", async () => {
	const { custom, token } = createTestApi();

	const myToken = token()
		.from(() => "asd")
		.build();

	// Obtain our token first
	await myToken.get();
	expect(await myToken.isValid()).toBeTruthy();

	const getData = custom(
		bearer(myToken),
		factory(() => {
			throw new RequestFailedError({
				status: 401,
			});
		}),
	);

	try {
		await getData.execute();
	} catch {}

	expect(await myToken.isValid()).toBeFalsy();
});

test("it converts token to headers", async () => {
	const { custom, token } = createTestApi();

	const myToken = token()
		.from(() => "asd")
		.build();

	const getData = custom(
		bearer(myToken),
		factory(({ headers }) => {
			return headers;
		}),
	);

	const res = await getData.execute();

	expect(await myToken.isValid()).toBeTruthy();

	const tokenValue = await myToken.get();
	expect(res).toEqual({
		Authorization: `Bearer ${tokenValue}`,
	});
});

test("it does not override prev headers when converted to headers", async () => {
	const { custom, token } = createTestApi();

	const tokenValue = "asdasd";

	const myToken = token()
		.from(() => tokenValue)
		.build();

	const getData = custom(
		headers({ hiThere: "asdasd" }),
		bearer(myToken),
		factory(({ headers }) => {
			return headers;
		}),
	);

	const res = await getData.execute();
	expect(await myToken.isValid()).toBeTruthy();

	const value = await myToken.get();
	expect(res).toStrictEqual({
		Authorization: `Bearer ${value}`,
		hiThere: "asdasd",
	});
});

test("it does not allow user provided headers to override injected token headers", async () => {
	const { custom, token } = createTestApi();

	const tokenValue = "asdasd";

	const myToken = token()
		.from(() => tokenValue)
		.build();

	const getData = custom(
		bearer(myToken),
		// Must be placed after bearer
		headers({ hiThere: "asdasd" }),
		factory(({ headers }) => {
			return headers;
		}),
	);

	const res = await getData.execute();
	expect(await myToken.isValid()).toBeTruthy();

	const value = await myToken.get();
	expect(res).toStrictEqual({
		Authorization: `Bearer ${value}`,
		hiThere: "asdasd",
	});
});
