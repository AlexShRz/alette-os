import { FatalApiError } from "@alette/pulse";
import { RequestInterruptedError } from "@alette/pulse";
import {
	handleError,
	setContext,
	setErrorHandler,
	setLoggerConfig,
} from "../application";
import { factory } from "../domain";
import { createTestApi } from "./utils/createTestApi";

test("it shuts down the system after receiving first fatal exception", async () => {
	const { api, custom } = createTestApi();
	let reachedFactory = false;
	let requestWasInterrupted = false;
	let loggedError = false;

	class MyError extends FatalApiError {}

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (error instanceof MyError) {
				loggedError = true;
			}
		}),
	);

	const getData = custom(
		factory(() => {
			reachedFactory = true;
			return new Promise(() => {
				// never resolve
			});
		}),
	);

	getData.execute().catch((e) => {
		/**
		 * All in progress requests must be shutdown
		 * */
		if (e instanceof RequestInterruptedError) {
			requestWasInterrupted = true;
		}
	});

	await vi.waitFor(() => {
		expect(reachedFactory).toBeTruthy();
	});

	api.tell(handleError(new MyError()));

	await vi.waitFor(() => {
		expect(loggedError).toBeTruthy();
		expect(requestWasInterrupted).toBeTruthy();
	});
});

test("it can access global context", async () => {
	const { api } = createTestApi();
	const context = { asdasdnasd: "asdas" };

	let caughtContext: typeof context | null = null;
	class MyError extends FatalApiError {}

	api.tell(
		setLoggerConfig((log) => log.mute()),
		setContext(context),
		setErrorHandler((_, { context }) => {
			caughtContext = context as any;
		}),
	);

	api.tell(handleError(new MyError()));

	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
	});
});
