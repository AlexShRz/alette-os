import { RequestFailedError } from "@alette/pulse";
import { bearer, factory } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils";

test("it loads cookie during request", async () => {
	const { custom, cookie } = createTestApi();
	let triedLoadingCookie = 0;

	const myCookie = cookie()
		.from(() => {
			triedLoadingCookie++;
		})
		.build();
	expect(await myCookie.isValid()).toBeFalsy();

	const getData = custom(
		bearer(myCookie),
		factory(() => {
			return "asd";
		}),
	);

	await getData.execute();
	expect(await myCookie.isValid()).toBeTruthy();
	expect(triedLoadingCookie).toBe(1);
});

test("it marks cookie as invalid if the request fails with unauthenticated status", async () => {
	const { custom, cookie } = createTestApi();

	const myCookie = cookie()
		.from(() => {})
		.build();

	// Obtain our cookie first
	await myCookie.load();
	expect(await myCookie.isValid()).toBeTruthy();

	const getData = custom(
		bearer(myCookie),
		factory(() => {
			throw new RequestFailedError({
				status: 401,
			});
		}),
	);

	try {
		await getData.execute();
	} catch {}

	expect(await myCookie.isValid()).toBeFalsy();
});

test("it instructs requests to include credentials when a cookie is passed ", async () => {
	const { custom, cookie } = createTestApi();

	const myCookie = cookie()
		.from(() => {})
		.build();

	const getData = custom(
		bearer(myCookie),
		factory(({ credentials }) => {
			return { credentials };
		}),
	);

	const res = await getData.execute();
	expect(await myCookie.isValid()).toBeTruthy();

	expect(res).toEqual({
		credentials: `include`,
	});
});
