import { THttpStatusCode } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { setOrigin } from "../../../application";
import { as, output } from "../../../domain";
import { createTestApi, server } from "../../utils";
import { boundary } from "../../utils/server";

test(
	"it does not retry requests",
	boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let enteredTimes = 0;

		const { mutation } = core.use();

		server.use(
			http.post(testUrl.build(), async () => {
				enteredTimes++;
				throw HttpResponse.json(null);
			}),
		);

		const getData = mutation(output(as<null>()));

		getData.spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(1);
		});
	}),
);

test.each([[401 as THttpStatusCode], [419 as THttpStatusCode]])(
	"it retries errors with %s status code",
	boundary(async (errorCode) => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let enteredTimes = 0;

		const { mutation } = core.use();

		server.use(
			http.post(testUrl.build(), async () => {
				enteredTimes++;
				throw HttpResponse.json(null, { status: errorCode });
			}),
		);

		const getData = mutation(output(as<null>()));

		getData.spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(2);
		});
	}),
);
