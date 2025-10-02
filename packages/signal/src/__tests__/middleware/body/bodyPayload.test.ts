import { r, request } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { body, factory, posts } from "../../../domain";
import { createTestApi } from "../../utils/createTestApi";
import { server } from "../../utils/server";

test(
	"it sets headers and body for plain text transfer",
	server.boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const myBody = "asdasdaasd";
		const expectedHeaders = {
			"Content-Type": "text/plain;charset=UTF-8",
		};
		let returned: any = null;

		server.use(
			http.post(testUrl.build(), async ({ request }) => {
				const headers = Object.fromEntries(request.headers.entries());
				const body = await request.text();
				return HttpResponse.json([body, headers]);
			}),
		);

		const getData = custom(
			body(myBody),
			factory(({ body, headers }) => {
				returned = [body, headers];
				return true;
			}),
		);
		await getData.execute();
		const returned2 = await getData
			.with(
				posts(),
				factory(({ body, method, headers }) =>
					request(
						r.route(testUrl),
						r.body(body),
						r.method(method),
						r.headers(headers),
					).execute(),
				),
			)
			.execute();

		await vi.waitFor(() => {
			expect(returned[0]).toStrictEqual(myBody);
			expect(returned[1]).toStrictEqual(expectedHeaders);
			expect((returned2 as any)[0]).toStrictEqual(myBody);
			expect((returned2 as any)[1]).toEqual(
				expect.objectContaining({
					"content-type": expectedHeaders["Content-Type"],
				}),
			);
		});
	}),
);

test(
	"it sets headers and body for json transfer",
	server.boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const myBody = {};
		const expectedHeaders = {
			"Content-Type": "application/json;charset=UTF-8",
		};
		let returned: any = null;

		server.use(
			http.post(testUrl.build(), async ({ request }) => {
				return HttpResponse.json([
					await request.json(),
					Object.fromEntries(request.headers.entries()),
				]);
			}),
		);

		const getData = custom(
			body(myBody),
			factory(({ body, headers }) => {
				returned = [body, headers];
				return true;
			}),
		);

		await getData.execute();
		const returned2 = await getData
			.with(
				posts(),
				factory(({ body, method, headers }) =>
					request(
						r.route(testUrl),
						r.body(body),
						r.method(method),
						r.headers(headers),
					).execute(),
				),
			)
			.execute();

		await vi.waitFor(() => {
			expect(returned[0]).toStrictEqual(myBody);
			expect(returned[1]).toStrictEqual(expectedHeaders);
			expect((returned2 as any)[0]).toStrictEqual(myBody);
			expect((returned2 as any)[1]).toEqual(
				expect.objectContaining({
					"content-type": expectedHeaders["Content-Type"],
				}),
			);
		});
	}),
);

test(
	"it sets headers and body for encoded url transfer",
	server.boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const queryParams = "foo=1&bar=2&baz=3";
		const myBody = new URLSearchParams(queryParams);
		const expectedHeaders = {
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
		};
		let returned: any = null;

		server.use(
			http.post(testUrl.build(), async ({ request }) => {
				return HttpResponse.json([
					await request.text(),
					Object.fromEntries(request.headers.entries()),
				]);
			}),
		);

		const getData = custom(
			body(myBody),
			factory(({ body, headers }) => {
				returned = [body, headers];
				return true;
			}),
		);

		await getData.execute();
		const returned2 = await getData
			.with(
				posts(),
				factory(({ body, method, headers }) =>
					request(
						r.route(testUrl),
						r.body(body),
						r.method(method),
						r.headers(headers),
					).execute(),
				),
			)
			.execute();

		await vi.waitFor(() => {
			expect(returned[0]).toStrictEqual(myBody);
			expect(returned[1]).toStrictEqual(expectedHeaders);
			expect((returned2 as any)[0]).toStrictEqual(queryParams);
			expect((returned2 as any)[1]).toEqual(
				expect.objectContaining({
					"content-type": expectedHeaders["Content-Type"],
				}),
			);
		});
	}),
);

test(
	"it sets body payload only for form data transfer",
	server.boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const myBody = new FormData();
		const expectedHeaders = {};
		let returned: any = null;

		server.use(
			http.post(testUrl.build(), async ({ request }) => {
				const data = await request.formData();

				return HttpResponse.json([
					data instanceof FormData,
					Object.fromEntries(request.headers.entries()),
				]);
			}),
		);

		const getData = custom(
			body(myBody),
			factory(({ body, headers }) => {
				returned = [body, headers];
				return true;
			}),
		);

		await getData.execute();
		const returned2 = await getData
			.with(
				posts(),
				factory(({ body, method, headers }) =>
					request(
						r.route(testUrl),
						r.body(body),
						r.method(method),
						r.headers(headers),
					).execute(),
				),
			)
			.execute();

		await vi.waitFor(() => {
			expect(returned[0]).toStrictEqual(myBody);
			expect(returned[1]).toStrictEqual(expectedHeaders);
			expect((returned2 as any)[0]).toBeTruthy();
			const contentHeader: string = (returned2 as any)[1]["content-type"];
			expect(contentHeader.includes("multipart/form-data")).toBeTruthy();
		});
	}),
);

test.each([
	["blob" as const, () => new Blob(), Blob],
	["ArrayBuffer" as const, () => new ArrayBuffer(), ArrayBuffer],
	/**
	 * 1. Xhr never returns Uint8Array, only ArrayBuffer
	 * 2. "fetch" can return Uint8Array, but Pulse uses Xhr exclusively.
	 * */
	["Uint8Array" as const, () => new Uint8Array(), ArrayBuffer],
])(
	"it sets headers and body for %s transfer",
	server.boundary(async (bodyType, getBody, BodyConstructor) => {
		const { custom, testUrl } = createTestApi();
		const myBody = getBody();
		const expectedHeaders = {
			"Content-Type": "application/octet-stream",
		};
		let returned: any = null;

		server.use(
			http.post(testUrl.build(), async ({ request }) => {
				const headers = Object.fromEntries(request.headers.entries());

				if (bodyType === "blob") {
					const data = await request.blob();
					return HttpResponse.json([data instanceof BodyConstructor, headers]);
				}

				const data = await request.arrayBuffer();
				return HttpResponse.json([
					data instanceof BodyConstructor,
					Object.fromEntries(request.headers.entries()),
				]);
			}),
		);

		const getData = custom(
			body(myBody),
			factory(({ body, headers }) => {
				returned = [body, headers];
				return true;
			}),
		);

		await getData.execute();
		const returned2 = await getData
			.with(
				posts(),
				factory(({ body, method, headers }) =>
					request(
						r.route(testUrl),
						r.body(body),
						r.method(method),
						r.headers(headers),
					).execute(),
				),
			)
			.execute();

		await getData.execute();
		await vi.waitFor(() => {
			expect(returned[0]).toStrictEqual(myBody);
			expect(returned[1]).toStrictEqual(expectedHeaders);
			expect((returned2 as any)[0]).toBeTruthy();
			expect((returned2 as any)[1]).toEqual(
				expect.objectContaining({
					"content-type": expectedHeaders["Content-Type"],
				}),
			);
		});
	}),
);
