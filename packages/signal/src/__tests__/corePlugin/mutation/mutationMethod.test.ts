import {
	HttpMethodValidationError,
	IHeaders,
	RequestInterruptedError,
	THttpMethod,
} from "@alette/pulse";
import { http, HttpResponse } from "msw";
import {
	setErrorHandler,
	setLoggerConfig,
	setOrigin,
} from "../../../application";
import { as, gets, method, output } from "../../../domain";
import { createTestApi, server } from "../../utils";

test(
	"it uses POST by default",
	server.boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		const responseValue = { asddasd: "sadasda" };

		const { mutation } = core.use();

		server.use(
			http.post(testUrl.build(), () => {
				return HttpResponse.json(responseValue);
			}),
		);

		const getData = mutation(output(as<IHeaders>()));
		const res = await getData();

		await vi.waitFor(() => {
			expect(res).toEqual(responseValue);
		});
	}),
);

test("it does not allow to use GET method for mutations", async () => {
	const { api, testUrl, core } = createTestApi();
	let failed = false;

	api.tell(
		setOrigin(testUrl.getOrigin()),
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (
				error instanceof HttpMethodValidationError &&
				error.getInvalidMethod() === "GET"
			) {
				failed = true;
			}
		}),
	);

	const { mutation } = core.use();

	const getData = mutation(output(as<IHeaders>()), gets());

	await expect(() => getData()).rejects.toThrowError(RequestInterruptedError);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});

test.each([
	["POST" as THttpMethod],
	["PATCH" as THttpMethod],
	["PUT" as THttpMethod],
	["DELETE" as THttpMethod],
])(
	"it allows to use different http methods",
	server.boundary(async (passedMethod) => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		const responseValue = { asddasd: "sadasda" };

		const { mutation } = core.use();

		if (passedMethod === "POST") {
			server.use(
				http.post(testUrl.build(), () => {
					return HttpResponse.json(responseValue);
				}),
			);
		}
		if (passedMethod === "PUT") {
			server.use(
				http.put(testUrl.build(), () => {
					return HttpResponse.json(responseValue);
				}),
			);
		}
		if (passedMethod === "PATCH") {
			server.use(
				http.patch(testUrl.build(), () => {
					return HttpResponse.json(responseValue);
				}),
			);
		}
		if (passedMethod === "DELETE") {
			server.use(
				http.delete(testUrl.build(), () => {
					return HttpResponse.json(responseValue);
				}),
			);
		}

		const getData = mutation(output(as<IHeaders>()), method(passedMethod));
		const res = await getData();

		await vi.waitFor(() => {
			expect(res).toEqual(responseValue);
		});
	}),
);
