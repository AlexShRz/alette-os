import { factory, origin } from "../../../domain";
import { createTestApi } from "../../utils";

const ORIGIN = "https://example.com";

beforeEach(() => {
	vi.stubGlobal("location", { origin: ORIGIN });
});

/**
 * This works in browsers/web workers/service workers.
 * */
test("it uses default globalThis origin if the origin was not set", async () => {
	const { custom, testUrl } = createTestApi();
	const value = testUrl.setOrigin(ORIGIN).getOrigin();

	const getData = custom(
		origin(),
		factory(({ origin, url }) => {
			return [origin, url.getOrigin()];
		}),
	);

	const result = await getData();
	expect(result).toEqual([value, value]);
});
