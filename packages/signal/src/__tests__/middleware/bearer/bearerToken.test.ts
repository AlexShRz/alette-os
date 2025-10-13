import { RequestFailedError, r, request } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { bearer, factory, headers, throws } from "../../../domain";
import { createTestApi } from "../../utils";
import { server } from "../../utils/server";

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
		throws(RequestFailedError),
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

test(
	"it converts token to headers",
	server.boundary(async () => {
		const { custom, token, testUrl } = createTestApi();
		const tokenValue = "asd";
		const expectedHeaders = {
			Authorization: `Bearer ${tokenValue}`,
		};

		server.use(
			http.get(testUrl.build(), async ({ request }) => {
				return HttpResponse.json(Object.fromEntries(request.headers.entries()));
			}),
		);

		const myToken = token()
			.from(() => tokenValue)
			.build();

		const getData = custom(
			bearer(myToken),
			factory(({ headers }) => {
				return headers;
			}),
		);

		const res = await getData.execute();
		expect(await myToken.isValid()).toBeTruthy();
		expect(res).toEqual(expectedHeaders);

		const obtainedToken = await myToken.get();
		expect(obtainedToken).toEqual(tokenValue);

		const res2 = await getData
			.with(
				factory(({ headers, url }) => {
					return request(
						r.route(url.setOrigin(testUrl.getOrigin())),
						r.headers(headers),
					).execute();
				}),
			)
			.execute();
		expect(res2).toEqual(
			expect.objectContaining({
				authorization: expectedHeaders["Authorization"],
			}),
		);
	}),
);

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
