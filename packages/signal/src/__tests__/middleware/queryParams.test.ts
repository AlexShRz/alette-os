import { r, request } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { factory, origin, queryParams } from "../../domain";
import { createTestApi } from "../utils/createTestApi";
import { server } from "../utils/server";

test(
	"it sets query params",
	server.boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const params = { hey: "asdasd" };

		server.use(
			http.get(testUrl.build(), async ({ request }) => {
				const url = new URL(request.url);
				return HttpResponse.json(
					Object.fromEntries(url.searchParams.entries()),
				);
			}),
		);

		const getData = custom(
			queryParams(params),
			factory(({ queryParams, url }) => {
				return [queryParams, url.getParams().get()];
			}),
		);
		const returned2 = await getData
			.with(
				factory(({ url }) =>
					request(r.route(url.setOrigin(testUrl.getOrigin()))).execute(),
				),
			)
			.execute();

		const result = await getData.execute();

		await vi.waitFor(() => {
			expect(result).toStrictEqual([params, params]);
			expect(returned2).toStrictEqual(params);
		});
	}),
);

test("it composes query params", async () => {
	const { custom } = createTestApi();
	const params1 = { hey: "asdasd" };
	const params2 = { asdasd: "222" };
	const params3 = { asdasd: "asvvv" };
	const params4 = { sdsd: 343434 };

	const expected = {
		...params1,
		...params2,
		...params3,
		...params4,
	};

	const getData = custom(
		queryParams(async (prev) => ({ ...prev, ...params1 })),
		queryParams((prev) => ({ ...prev, ...params2 })),
		queryParams(async (prev) => ({ ...prev, ...params3 })),
		queryParams((prev) => ({ ...prev, ...params4 })),
		factory(({ queryParams, url }) => {
			return [queryParams, url.getParams().get()];
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toStrictEqual([expected, expected]);
	});
});

test("it can override query params set by upstream middleware", async () => {
	const { custom } = createTestApi();
	const params1 = { hey: "asdasd" };
	const params2 = { asdasd: "222" };
	const params3 = { asdasd: "asvvv" };
	const params4 = { sdsd: 343434 };

	const expected = {
		asasdasdasdasdasd: "asdasd",
	};

	const getData = custom(
		queryParams(async (prev) => ({ ...prev, ...params1 })),
		queryParams((prev) => ({ ...prev, ...params2 })),
		queryParams(async (prev) => ({ ...prev, ...params3 })),
		queryParams((prev) => ({ ...prev, ...params4 })),
		queryParams(expected),
		factory(({ queryParams, url }) => {
			return [queryParams, url.getParams().get()];
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toStrictEqual([expected, expected]);
	});
});

test("it does not add empty query params to the url", async () => {
	const { custom } = createTestApi();
	const myOrigin = "https://www.wikipedia.org";

	const getData = custom(
		origin(myOrigin),
		queryParams({}),
		factory(({ url }) => {
			return url.toString();
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toStrictEqual(myOrigin);
	});
});
