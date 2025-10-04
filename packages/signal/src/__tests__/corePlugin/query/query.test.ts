import { IHeaders } from "@alette/pulse";
import { http, HttpResponse, delay } from "msw";
import { setOrigin } from "../../../application";
import { as, bearer, headers, output } from "../../../domain";
import { createTestApi, server } from "../../utils";

test(
	"it includes headers",
	server.boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		const expectedHeaders = {
			"my-header": "asdas",
		};

		const { query } = core.use();

		server.use(
			http.get(testUrl.build(), async ({ request }) => {
				return HttpResponse.json(Object.fromEntries(request.headers.entries()));
			}),
		);

		const getData = query(output(as<IHeaders>()), headers(expectedHeaders));

		const res = await getData.execute();

		await vi.waitFor(() => {
			expect(res).toEqual(expect.objectContaining(expectedHeaders));
		});
	}),
);

test(
	"it includes credentials if needed",
	server.boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		const { query, cookie } = core.use();

		const authCookie = cookie()
			.from(() => {})
			.build();

		server.use(
			http.get(testUrl.build(), async ({ request }) => {
				return HttpResponse.json(request.credentials === "same-origin");
			}),
		);

		const res = await query(
			output(as<boolean>()),
			bearer(authCookie),
		).execute();

		await vi.waitFor(() => {
			expect(res).toBeTruthy();
		});
	}),
);

test(
	"it runs automatically on mount",
	server.boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		const value = { asdsa: "asda" };

		const { query } = core.use();

		server.use(
			http.get(testUrl.build(), async () => {
				return HttpResponse.json(value);
			}),
		);

		const getData = query(output(as<unknown>()));

		const { getState } = getData.mount();

		await vi.waitFor(() => {
			expect(getState().data).toEqual(value);
		});
	}),
);

test(
	"it allows users to cancel the request",
	server.boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		let reachedApi = false;

		const { query } = core.use();

		server.use(
			http.get(testUrl.build(), async () => {
				reachedApi = true;
				await delay("infinite");
			}),
		);

		const getData = query(output(as<IHeaders>()));

		const { getState, cancel } = getData.mount();

		await vi.waitFor(() => {
			expect(getState().isLoading).toBeTruthy();
			expect(reachedApi).toBeTruthy();
		});

		cancel();

		await vi.waitFor(() => {
			const { isLoading, isError } = getState();

			expect(isLoading).toBeFalsy();
			expect(isError).toBeFalsy();
		});
	}),
);
