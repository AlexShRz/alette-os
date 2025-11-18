import { IHeaders } from "@alette/pulse";
import { http, HttpResponse, delay } from "msw";
import { setOrigin } from "../../../application";
import { as, bearer, output } from "../../../domain";
import { createTestApi, server } from "../../utils";

test(
	"it includes credentials if needed",
	server.boundary(async () => {
		const { api, testUrl, core, auth } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		const { mutation } = core.use();
		const { cookie } = auth.use();

		const authCookie = cookie()
			.from(() => {})
			.build();

		server.use(
			http.post(testUrl.build(), async ({ request }) => {
				return HttpResponse.json(request.credentials === "same-origin");
			}),
		);

		const res = await mutation(output(as<boolean>()), bearer(authCookie))();

		await vi.waitFor(() => {
			expect(res).toBeTruthy();
		});
	}),
);

test.fails(
	"it does not run on mount automatically",
	server.boundary(async () => {
		const { api, testUrl, core } = createTestApi();
		api.tell(setOrigin(testUrl.getOrigin()));
		const value = { asdsa: "asda" };

		const { mutation } = core.use();

		server.use(
			http.post(testUrl.build(), async () => {
				return HttpResponse.json(value);
			}),
		);

		const getData = mutation(output(as<unknown>()));

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

		const { mutation } = core.use();

		server.use(
			http.post(testUrl.build(), async () => {
				reachedApi = true;
				await delay("infinite");
			}),
		);

		const getData = mutation(output(as<IHeaders>()));

		const { getState, execute, cancel } = getData.mount();
		execute();

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
