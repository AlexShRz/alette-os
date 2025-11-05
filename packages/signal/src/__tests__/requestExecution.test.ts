import { r, request } from "@alette/pulse";
import { http, HttpResponse } from "msw";
import { as, factory, input, output } from "../domain";
import { createTestApi } from "./utils/createTestApi";
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
			input(as<string>()),
			output(as<string>()),
			factory(() => request(r.route(testUrl.clone())).execute()),
		);

		const response = await getData({ args: "asdas" });
		expect(response).toEqual(value);
	}),
);
