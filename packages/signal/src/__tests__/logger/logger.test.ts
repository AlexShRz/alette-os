import { FatalApiError } from "@alette/pulse";
import { setLoggerConfig } from "../../application";
import { path, factory } from "../../domain";
import { createTestApi } from "../../shared/testUtils";

beforeAll(() => {
	vi.restoreAllMocks();
});

test("it can log fatal errors", async () => {
	const { api, custom } = createTestApi();

	// Spy on console.log
	const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

	api.tell(setLoggerConfig((logger) => logger.unmuteFatal()));

	class TestError extends FatalApiError {
		constructor() {
			super("TestError");
		}
	}

	const getData = custom(
		path(() => {
			throw new TestError();
		}),
		factory(() => {
			return true;
		}),
	);

	getData.execute().catch((e) => e);

	await vi.waitFor(() => {
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("TestError"));
	});
});
