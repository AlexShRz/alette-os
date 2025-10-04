import { CannotSetOriginError, r, request } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { setErrorHandler, setLoggerConfig, setOrigin } from "../../application";
import { factory, origin } from "../../domain";
import { createTestApi } from "../utils/createTestApi";
import { server } from "../utils/server";

test(
	"it uses globally set origin if nothing was provided",
	server.boundary(async () => {
		const { api, custom, testUrl } = createTestApi();
		const value = testUrl.getOrigin();
		api.tell(setOrigin(value));

		server.use(
			http.get(testUrl.build(), async ({ request }) => {
				return HttpResponse.text(new URL(request.url).origin);
			}),
		);

		const getData = custom(
			origin(),
			factory(({ origin, url }) => {
				return [origin, url.getOrigin()];
			}),
		);

		const result = await getData.execute();
		const result2 = await getData
			.with(factory(({ url }) => request(r.route(url), r.outText()).execute()))
			.execute();

		await vi.waitFor(() => {
			expect(result).toEqual([value, value]);
			expect(result2).toEqual(value);
		});
	}),
);

test("it can compose origins", async () => {
	const { api, custom } = createTestApi();
	const myOrigin = "https://www.wikipedia.org";
	const value1 = myOrigin.replace("wikipedia", "url1");
	const value2 = value1.replace("url1", "url2");
	const value3 = value2.replace("url2", "url3");

	api.tell(setOrigin(myOrigin));

	const getData = custom(
		origin(),
		origin((_, prev) => prev.replace("wikipedia", "url1")),
		origin((_, prev) => prev.replace("url1", "url2")),
		origin((_, prev) => prev.replace("url2", "url3")),
		factory(({ origin, url }) => {
			return [origin, url.getOrigin()];
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toEqual([value3, value3]);
	});
});

test("it can override origin set by upstream middleware", async () => {
	const { api, custom } = createTestApi();
	const myOrigin = "https://www.wikipedia.org";
	const myOrigin2 = "https://www.hellooothere.org";

	api.tell(setOrigin(myOrigin));

	const getData = custom(
		origin(),
		origin((_, prev) => prev.replace("wikipedia", "url1")),
		origin((_, prev) => prev.replace("url1", "url2")),
		origin((_, prev) => prev.replace("url2", "url3")),
		origin(myOrigin2),
		factory(({ origin, url }) => {
			return [origin, url.getOrigin()];
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toEqual([myOrigin2, myOrigin2]);
	});
});

test("it throws a fatal error if the path is incorrect", async () => {
	const { api, custom } = createTestApi();
	let failed = false;

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (error instanceof CannotSetOriginError) {
				failed = true;
			}
		}),
	);

	const getData = custom(
		origin("21423423"),
		factory(() => {
			return true;
		}),
	);

	getData.execute().catch((e) => e);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});
