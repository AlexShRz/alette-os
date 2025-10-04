import { RequestFailedError, r, request } from "@alette/pulse";
import { beforeEach } from "@effect/vitest";
import { http, HttpResponse } from "msw";
import { as, factory, output, retry } from "../../../domain";
import { createTestApi } from "../../utils";
import { server } from "../../utils/server";

beforeEach(() => {
	vi.useRealTimers();
});

test("it skips status related logic if the error does not contain statuses", async () => {
	const { custom } = createTestApi();
	let enteredTimes = 0;

	const getData = custom(
		output(as<string>()),
		factory(() => {
			enteredTimes++;
			/**
			 * Use errors recognized by retry() here
			 * */
			throw new RequestFailedError();
		}),
		retry({
			times: 2,
			whenStatus: [400],
		}),
	);

	try {
		await getData.execute();
	} catch {}

	expect(enteredTimes).toEqual(3);
});

/**
 * Do not use 3xx statuses here. XHR marks them as network errors and
 * does not process them properly - triggering onerror and returning status=0
 * */
test.each([
	[400, true],
	[500, true],
	[401, true],
	[403, false],
])(
	"it retries requests only if their errors contain statuses from the list",
	server.boundary(async (status, shouldBeRetried) => {
		const { custom, testUrl } = createTestApi();
		let enteredTimes = 0;

		server.use(
			http.get(testUrl.build(), () => {
				return HttpResponse.json(null, { status });
			}),
		);

		const getData = custom(
			output(as<string>()),
			factory(({ url }) => {
				enteredTimes++;
				return request(r.route(url.setOrigin(testUrl.getOrigin()))).execute();
			}),
			retry({
				times: 2,
				whenStatus: [400, 500, 401],
			}),
		);

		try {
			await getData.execute();
		} catch {}

		if (shouldBeRetried) {
			expect(enteredTimes).toEqual(3);
		} else {
			expect(enteredTimes).toEqual(1);
		}
	}),
);

/**
 * Do not use 3xx statuses here. XHR marks them as network errors and
 * does not process them properly - triggering onerror and returning status=0
 * */
test.each([
	[400, true],
	[500, true],
	[401, true],
	[403, false],
])(
	"it overrides ‘unless status’ configuration",
	server.boundary(async (status, shouldBeRetried) => {
		const { custom, testUrl } = createTestApi();
		let enteredTimes = 0;

		server.use(
			http.get(testUrl.build(), () => {
				return HttpResponse.json(null, { status });
			}),
		);

		const getData = custom(
			output(as<string>()),
			factory(({ url }) => {
				enteredTimes++;
				return request(r.route(url.setOrigin(testUrl.getOrigin()))).execute();
			}),
			retry({
				times: 2,
				whenStatus: [400, 500, 401],
				unlessStatus: [400, 500, 401],
			}),
		);

		try {
			await getData.execute();
		} catch {}

		if (shouldBeRetried) {
			expect(enteredTimes).toEqual(3);
		} else {
			expect(enteredTimes).toEqual(1);
		}
	}),
);
