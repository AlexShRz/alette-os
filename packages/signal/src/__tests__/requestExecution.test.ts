import { makeUrl, r, request } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { path, factory, input, output, type } from "../domain";
import { createTestApi } from "../shared/testUtils/createTestApi";
import { server } from "./utils/server";

/**
 * Just a simple sanity check
 * */
test(
	"it executes requests",
	server.boundary(async () => {
		const { custom } = createTestApi();
		const value = "asdasjkdh";

		const url = "https://example.com/user";

		server.use(
			http.get(url, () => {
				return HttpResponse.text(value);
			}),
		);

		const getData = custom(
			input(type<string>()),
			output(type<string>()),
			path("/hey"),
			factory(() => request(r.route(makeUrl(url))).execute()),
		);

		const response = await getData.execute();
		expect(response).toEqual(value);
	}),
);
