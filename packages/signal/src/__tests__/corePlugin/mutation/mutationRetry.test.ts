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

test(
	"it retries errors with 401 status code",
	boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let enteredTimes = 0;

		const { mutation } = core.use();

		server.use(
			http.post(testUrl.build(), async () => {
				enteredTimes++;
				throw HttpResponse.json(null, { status: 401 });
			}),
		);

		const getData = mutation(output(as<null>()));

		getData.spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(2);
		});
	}),
);
