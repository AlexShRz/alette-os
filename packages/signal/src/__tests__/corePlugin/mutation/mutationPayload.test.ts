import { IHeaders } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { setOrigin } from "../../../application";
import { body, headers, output, type } from "../../../domain";
import { createTestApi, server } from "../../utils";

test(
	"it includes headers",
	server.boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		const expectedHeaders = {
			"my-header": "asdas",
		};

		const { mutation } = core.use();

		server.use(
			http.post(testUrl.build(), async ({ request }) => {
				return HttpResponse.json(Object.fromEntries(request.headers.entries()));
			}),
		);

		const getData = mutation(
			output(type<IHeaders>()),
			headers(expectedHeaders),
		);

		const res = await getData.execute();

		await vi.waitFor(() => {
			expect(res).toEqual(expect.objectContaining(expectedHeaders));
		});
	}),
);

test(
	"it includes body",
	server.boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		const myBody = {
			hello: "asdas",
		};

		const { mutation } = core.use();

		server.use(
			http.post(testUrl.build(), async ({ request }) => {
				return HttpResponse.json(await request.json());
			}),
		);

		const getData = mutation(output(type<IHeaders>()), body(myBody));
		const res = await getData.execute();

		await vi.waitFor(() => {
			expect(res).toEqual(myBody);
		});
	}),
);
