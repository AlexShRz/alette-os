import {
	ApiError,
	FatalApiError,
	RequestInterruptedError,
} from "@alette/pulse";
import { setErrorHandler, setLoggerConfig } from "../../application";
import { UnknownErrorCaught, factory } from "../../domain";
import { createTestApi } from "../utils";

class MyFatalError extends FatalApiError {}

class MyError extends ApiError {
	protected cloneSelf() {
		return new MyError();
	}
}

test("it treats unknown errors as fatal", async () => {
	const { api, custom } = createTestApi();
	let failed = false;
	let executedTimes = 0;
	const response = "hey";

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (
				error instanceof UnknownErrorCaught &&
				error.getUnknownError() instanceof MyError
			) {
				failed = true;
			}
		}),
	);

	const getData = custom(
		factory(() => {
			if (!executedTimes) {
				executedTimes++;
				return response;
			}

			throw new MyError();
		}),
	);

	expect(await getData.execute()).toEqual(response);

	getData.spawn();

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});

test("it shuts down the api if a fatal error is thrown", async () => {
	const { api, custom } = createTestApi();
	let failed = false;
	let reachedOtherRequest = false;
	let interruptedOthers = false;

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (error instanceof MyFatalError) {
				failed = true;
			}
		}),
	);

	const request2 = custom(
		factory(() => {
			reachedOtherRequest = true;
			// never resolve
			return new Promise(() => {});
		}),
	);

	const getData = custom(
		factory(() => {
			throw new MyFatalError();
		}),
	);

	request2.execute().catch((e) => {
		if (e instanceof RequestInterruptedError) {
			interruptedOthers = true;
		}
	});

	await vi.waitFor(() => {
		expect(reachedOtherRequest).toBeTruthy();
	});

	getData.spawn();

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
		expect(interruptedOthers).toBeTruthy();
	});
});
