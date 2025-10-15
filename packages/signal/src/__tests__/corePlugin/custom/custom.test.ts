import { THttpStatusCode, r, request } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { setOrigin } from "../../../application";
import { as, factory, output } from "../../../domain";
import { createTestApi, server } from "../../utils";
import { boundary } from "../../utils/server";

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

test.each([[401 as THttpStatusCode], [419 as THttpStatusCode]])(
	"it retries errors with %s status code",
	boundary(async (errorStatus) => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let enteredTimes = 0;

		const { custom } = core.use();

		server.use(
			http.post(testUrl.build(), async () => {
				enteredTimes++;
				throw HttpResponse.json(null, { status: errorStatus });
			}),
		);

		const getData = custom(
			output(as<null>()),
			factory(({ url }) => request(r.route(url), r.method("POST")).execute()),
		);

		getData.spawn();

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(2);
		});
	}),
);
