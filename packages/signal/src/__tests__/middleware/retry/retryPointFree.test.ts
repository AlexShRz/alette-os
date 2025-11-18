import { http, HttpResponse } from "msw";
import { setOrigin } from "../../../application";
import {
	DEFAULT_HTTP_RETRY_STATUSES,
	as,
	factory,
	output,
	retry,
	throws,
} from "../../../domain";
import { createTestApi, server } from "../../utils";
import { MyError } from "./retry.test";

test.each([[DEFAULT_HTTP_RETRY_STATUSES[0]]])(
	"it retries requests once in point-free mode",
	server.boundary(async (status) => {
		const { api, testUrl, custom } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let enteredTimes = 0;

		server.use(
			http.get(testUrl.build(), async () => {
				enteredTimes++;
				throw HttpResponse.json(null, { status });
			}),
		);

		custom(
			output(as<string>()),
			throws(MyError),
			factory(() => {
				enteredTimes++;
				throw new MyError();
			}),
			retry,
		).spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(2);
		});
	}),
);

test.each([...DEFAULT_HTTP_RETRY_STATUSES.map((c) => [c])])(
	"it retries requests on '%s' http status in point-free mode",
	server.boundary(async (status) => {
		const { api, testUrl, custom } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let enteredTimes = 0;

		server.use(
			http.get(testUrl.build(), async () => {
				enteredTimes++;
				throw HttpResponse.json(null, { status });
			}),
		);

		custom(
			output(as<string>()),
			throws(MyError),
			factory(() => {
				enteredTimes++;
				throw new MyError();
			}),
			retry,
		).spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(2);
		});
	}),
);
