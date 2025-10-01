import { r, request } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { factory, input, output, type } from "../domain";
import { createTestApi } from "../shared/testUtils/createTestApi";
import { server } from "./utils/server";

/**
 * Just a simple sanity check
 * */
test(
	"it executes requests",
	server.boundary(async () => {
		const { custom, testUrl } = createTestApi();
		const value = { res: "asdasjkdh" };

		server.use(
			http.get(testUrl.build(), () => {
				return HttpResponse.json(value);
			}),
		);

		const getData = custom(
			input(type<string>()),
			output(type<string>()),
			factory(() => request(r.route(testUrl.clone())).execute()),
		);

		const response = await getData.execute();
		expect(response).toEqual(value);
	}),
);
