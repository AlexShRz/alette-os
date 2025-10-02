import { Effect as E } from "effect";
import { setProductionMode } from "../../application";
import { SystemLogger } from "../../domain/logger/SystemLogger";
import { createTestApi, mockConsoleLog, waitForApiMode } from "../utils";

beforeAll(() => {
	vi.restoreAllMocks();
});

const LOGGED_MESSAGE = "hello";

test("it logs fatal errors", async () => {
	const { api } = createTestApi();
	api.tell(setProductionMode());

	const logSpy = mockConsoleLog();

	await api.getApiRuntime().runPromise(
		E.gen(function* () {
			yield* waitForApiMode("production");
			yield* SystemLogger.logFatal(LOGGED_MESSAGE);
		}),
	);

	await vi.waitFor(() => {
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining(LOGGED_MESSAGE),
		);
	});
});
