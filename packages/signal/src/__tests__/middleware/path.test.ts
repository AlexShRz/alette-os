import { CannotSetPathError, r, request } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { setErrorHandler, setLoggerConfig } from "../../application";
import { path, factory } from "../../domain";
import { createTestApi } from "../utils/createTestApi";
import { server } from "../utils/server";

test(
	"it sets path",
	server.boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const path1 = "/heyyy";

		server.use(
			http.get(testUrl.setPath(path1).build(), ({ request }) => {
				return HttpResponse.text(new URL(request.url).pathname);
			}),
		);

		const getData = custom(
			path(path1),
			factory(({ path, url }) => {
				return [path, url.getPath()];
			}),
		);

		const result = await getData.execute();
		const result2 = await getData
			.with(
				factory(({ url }) =>
					request(
						r.route(url.setOrigin(testUrl.getOrigin())),
						r.outText(),
					).execute(),
				),
			)
			.execute();

		await vi.waitFor(() => {
			expect(result).toEqual([path1, path1]);
			expect(result2).toEqual(path1);
		});
	}),
);

test("it can compose paths", async () => {
	const { custom } = createTestApi();
	const path1 = "/heyyy";
	const path2 = "/heyyy2";

	const composedPath = `${path1}${path2}${path2}`;

	const getData = custom(
		path(path1),
		path((_, prev) => {
			return `${prev}${path2}`;
		}),
		path((_, prev) => {
			return `${prev}${path2}`;
		}),
		factory(({ path, url }) => {
			return [path, url.getPath()];
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toEqual([composedPath, composedPath]);
	});
});

test("it can override path set by upstream middleware", async () => {
	const { custom } = createTestApi();
	const path1 = "/heyyy";
	const path2 = "/heyyy2";
	const path3 = "/sdadsasdasdasd";

	const getData = custom(
		path(path1),
		path((_, prev) => {
			return `${prev}${path2}`;
		}),
		path((_, prev) => {
			return `${prev}${path2}`;
		}),
		path(path3),
		factory(({ path, url }) => {
			return [path, url.getPath()];
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toEqual([path3, path3]);
	});
});

test("it throws a fatal error if the path is incorrect", async () => {
	const { api, custom } = createTestApi();
	let failed = false;

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (error instanceof CannotSetPathError) {
				failed = true;
			}
		}),
	);

	const getData = custom(
		// @ts-expect-error
		path("21423423"),
		factory(() => {
			return true;
		}),
	);

	getData.execute().catch((e) => e);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});
