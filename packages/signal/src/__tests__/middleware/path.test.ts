import { CannotSetPathError } from "@alette/pulse";
import { setErrorHandler } from "../../application";
import { path, factory } from "../../domain";
import { createTestApi } from "../../shared/testUtils/createTestApi";

test("it sets path", async () => {
	const { custom } = createTestApi();
	const path1 = "/heyyy";

	const getData = custom(
		path(path1),
		factory(({ path, url }) => {
			return [path, url.getPath()];
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toEqual([path1, path1]);
	});
});

test("it can compose paths", async () => {
	const { custom } = createTestApi();
	const path1 = "/heyyy";
	const path2 = "/heyyy2";

	const composedPath = `${path1}${path2}${path2}`;

	const getData = custom(
		path(path1),
		path((prev) => {
			return `${prev}${path2}`;
		}),
		path((prev) => {
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
		path((prev) => {
			return `${prev}${path2}`;
		}),
		path((prev) => {
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
