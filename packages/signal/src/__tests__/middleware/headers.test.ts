import { HeaderValidationError, r, request } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { setErrorHandler, setLoggerConfig } from "../../application";
import { factory, headers } from "../../domain";
import { createTestApi } from "../utils/createTestApi";
import { server } from "../utils/server";

test(
	"it sets headers",
	server.boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const myHeaders = {
			hey: "there",
		};

		server.use(
			http.get(testUrl.build(), ({ request }) => {
				return HttpResponse.json(Object.fromEntries(request.headers.entries()));
			}),
		);

		const getData = custom(
			headers(myHeaders),
			factory(({ headers }) => {
				return headers;
			}),
		);

		const result = await getData.execute();
		const result2 = await getData
			.with(
				factory(({ url, headers }) =>
					request(
						r.headers(headers),
						r.route(url.setOrigin(testUrl.getOrigin())),
					).execute(),
				),
			)
			.execute();

		await vi.waitFor(() => {
			expect(result).toStrictEqual(myHeaders);
			expect(result2).toEqual(expect.objectContaining(myHeaders));
		});
	}),
);

test("it can be combined", async () => {
	const { custom } = createTestApi();
	const myHeaders1 = {
		hey: "there",
	};
	const myHeaders2 = {
		asdasd: "asdasd",
	};
	const myHeaders3 = {
		aaaaa: "asdasd",
	};

	const getData = custom(
		headers(myHeaders1),
		headers((_, prev) => ({ ...prev, ...myHeaders2 })),
		headers(async (_, prev) => ({ ...prev, ...myHeaders3 })),
		factory(({ headers }) => {
			return headers;
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toStrictEqual({
			...myHeaders1,
			...myHeaders2,
			...myHeaders3,
		});
	});
});

test.each([
	[
		{
			// Set non-serializable headers
			asdas: () => {},
		},
	],
	["asdasd"],
	[21312],
])(
	"it throws a fatal error if headers are incorrect",
	async (invalidHeaders) => {
		const { api, custom } = createTestApi();
		let failed = false;

		api.tell(
			setLoggerConfig((logger) => logger.mute()),
			setErrorHandler((error) => {
				if (error instanceof HeaderValidationError) {
					failed = true;
				}
			}),
		);

		const getData = custom(
			// @ts-expect-error
			headers(invalidHeaders),
			factory(() => {
				return true;
			}),
		);

		getData.execute().catch((e) => e);

		await vi.waitFor(() => {
			expect(failed).toBeTruthy();
		});
	},
);
