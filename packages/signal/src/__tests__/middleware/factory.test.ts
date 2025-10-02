import { FatalApiError } from "@alette/pulse";
import { setErrorHandler, setLoggerConfig } from "../../application";
import { factory } from "../../domain";
import { createTestApi } from "../utils";

test("it shuts down the api if a fatal error is thrown", async () => {
	const { api, custom } = createTestApi();
	let failed = false;

	class MyError extends FatalApiError {}

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (error instanceof MyError) {
				failed = true;
			}
		}),
	);
	const getData = custom(
		factory(() => {
			throw new MyError();
		}),
	);

	getData.spawn();

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});
