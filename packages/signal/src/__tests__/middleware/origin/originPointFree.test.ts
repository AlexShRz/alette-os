import { setOrigin } from "../../../application";
import { factory, origin } from "../../../domain";
import { createTestApi, server } from "../../utils";

test(
	"it uses global origin in point-free mode",
	server.boundary(async () => {
		const { api, custom, testUrl } = createTestApi();
		const value = testUrl.getOrigin();
		api.tell(setOrigin(value));

		const result = await custom(
			origin,
			factory(({ origin, url }) => {
				return [origin, url.getOrigin()];
			}),
		)();

		await vi.waitFor(() => {
			expect(result).toEqual([value, value]);
		});
	}),
);
