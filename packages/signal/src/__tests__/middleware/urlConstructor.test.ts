import { makeQueryParams } from "@alette/pulse";
import { path, url, factory, origin, queryParams } from "../../domain";
import { createTestApi } from "../../shared/testUtils/createTestApi";

test("it overrides default url constructor", async () => {
	const { custom } = createTestApi();
	const myOrigin = "https://www.wikipedia.org";
	const path1 = "/heyyy";
	const params = {
		hey: "asdasdasd",
	};
	const stringifiedParams = makeQueryParams(params).toString();

	const expectedUrl = `${myOrigin}${path1}?${stringifiedParams}`;

	const getData = custom(
		origin(myOrigin),
		queryParams(params),
		path(path1),
		url(
			({ path, origin, queryParams }) =>
				`${origin}${path}?${makeQueryParams(queryParams).toString()}`,
		),
		factory(({ url }) => {
			return url.toString();
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toEqual(expectedUrl);
	});
});

test("it has access to url props when placed before their providers in the chain", async () => {
	const { custom } = createTestApi();
	const myOrigin = "https://www.wikipedia.org";
	const path1 = "/heyyy";
	const params = {
		hey: "asdasdasd",
	};
	const stringifiedParams = makeQueryParams(params).toString();

	const expectedUrl = `${myOrigin}${path1}${stringifiedParams}`;

	const getData = custom(
		url(
			({ path, origin, queryParams }) =>
				`${origin}${path}${makeQueryParams(queryParams).toString()}`,
		),
		origin(myOrigin),
		queryParams(params),
		path(path1),
		factory(({ url }) => {
			return url.toString();
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toEqual(expectedUrl);
	});
});

test("it can accept full url", async () => {
	const { custom } = createTestApi();
	const value = "https://www.youtube.com/watch?v=F3B7M-3KfrA";

	const getData = custom(
		url(value),
		factory(({ url }) => {
			return url.toString();
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toEqual(value);
	});
});

test("it overrides middleware of the same type", async () => {
	const { custom } = createTestApi();
	const value1 = "https://www.youtube.com/watch?v=F3B7M-3KfrA";
	const value2 = "https://www.youtube.com/watch?v=McE0Fzn0ohE";

	const getData = custom(
		url(value1),
		url(value2),
		factory(({ url }) => {
			return url.toString();
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toEqual(value2);
	});
});
