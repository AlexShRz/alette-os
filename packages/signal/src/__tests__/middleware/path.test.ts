import { path, factory } from "../../domain";
import { RequestInterruptedError } from "../../shared/error/RequestInterruptedError";
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

test.todo("it throws a fatal error if our path is incorrect", async () => {
	const { custom } = createTestApi();

	const getData = custom(
		path("asldnbaskdbaskjbdas"),
		factory(() => {
			return true;
		}),
	);

	expect(await getData.execute()).rejects.toThrowError(RequestInterruptedError);
});
