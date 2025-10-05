import { THttpStatusCode } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { QUERY_RETRY_STATUSES, setOrigin } from "../../../application";
import { as, output } from "../../../domain";
import { createTestApi, server } from "../../utils";

test.each([QUERY_RETRY_STATUSES[0] as THttpStatusCode])(
	"it retries the request once",
	server.boundary(async (status) => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let enteredTimes = 0;

		const { query } = core.use();

		server.use(
			http.get(testUrl.build(), async () => {
				enteredTimes++;
				throw HttpResponse.json(null, { status });
			}),
		);

		const getData = query(output(as<null>()));

		getData.spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(2);
		});
	}),
);

test.each([...QUERY_RETRY_STATUSES.map((c) => [c])])(
	"it retries the request on preconfigured statuses",
	server.boundary(async (status) => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let enteredTimes = 0;

		const { query } = core.use();

		server.use(
			http.get(testUrl.build(), async () => {
				enteredTimes++;
				throw HttpResponse.json(null, { status });
			}),
		);

		const getData = query(output(as<null>()));

		getData.spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(2);
		});
	}),
);

test(
	"it retries errors with 401 status code",
	server.boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let enteredTimes = 0;

		const { query } = core.use();

		server.use(
			http.get(testUrl.build(), async () => {
				enteredTimes++;
				throw HttpResponse.json(null, { status: 401 });
			}),
		);

		const getData = query(output(as<null>()));

		getData.spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(2);
		});
	}),
);

test.each([403])(
	"it does not retry request on unknown statuses",
	server.boundary(async (status) => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let enteredTimes = 0;

		const { query } = core.use();

		server.use(
			http.get(testUrl.build(), async () => {
				enteredTimes++;
				throw HttpResponse.json(null, { status });
			}),
		);

		const getData = query(output(as<null>()));

		getData.spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(1);
		});
	}),
);
