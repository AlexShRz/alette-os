import { http, HttpResponse } from "msw";
import { setOrigin } from "../../../application";
import { output, type } from "../../../domain";
import { createTestApi, server } from "../../utils";

test(
	"it does not retry requests",
	server.boundary(async () => {
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

		const getData = mutation(output(type<null>()));

		getData.spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(1);
		});
	}),
);
