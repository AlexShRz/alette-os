import { http, HttpResponse } from "msw";
import { as, factory, input, output, r, request, slot } from "../domain";
import { createTestApi, server } from "./utils";

test("it injects multiple middleware at once", async () => {
	const { custom, testUrl } = createTestApi();
	const value = { res: "asdasjkdh" };

	server.use(
		http.get(testUrl.build(), () => {
			return HttpResponse.json(value);
		}),
	);

	const withCommonMiddleware = slot(
		input(as<string>()),
		// output(as<string>()),
		// factory(({ args }) => request(r.route(testUrl.clone()))()),
	);

	const getData = custom(...withCommonMiddleware());

	const response = await getData({ args: "asdas" });
	expect(response).toEqual(value);
});
