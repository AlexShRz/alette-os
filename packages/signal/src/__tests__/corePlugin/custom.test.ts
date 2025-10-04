import { http, HttpResponse } from "msw";
import { setOrigin } from "../../application";
import { as, factory, output } from "../../domain";
import { createTestApi, server } from "../utils";

test(
	"it can combine data from multiple requests",
	server.boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		const queryResponse = {
			helloThere: "asddasd",
		};
		const mutationResponse = {
			asdasda: "asddasd",
		};
		const expectedCustomResponse = {
			...queryResponse,
			...mutationResponse,
		};

		const { mutation, query, custom } = core.use();

		server.use(
			http.get(testUrl.build(), () => {
				return HttpResponse.json(queryResponse);
			}),
			http.post(testUrl.build(), () => {
				return HttpResponse.json(mutationResponse);
			}),
		);

		const myQuery = query(output(as<typeof queryResponse>()));
		const myMutation = mutation(output(as<typeof mutationResponse>()));

		const res = await custom(
			factory(async () => {
				const data1 = await myQuery.execute();
				const data2 = await myMutation.execute();

				return {
					...data1,
					...data2,
				};
			}),
		).execute();

		await vi.waitFor(() => {
			expect(res).toEqual(expectedCustomResponse);
		});
	}),
);
