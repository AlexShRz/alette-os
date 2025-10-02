import { ApiError } from "@alette/pulse";
import { setErrorHandler, setLoggerConfig } from "../../application";
import { UnknownErrorCaught, factory, throws } from "../../domain";
import { createTestApi } from "../utils/createTestApi";

test("it throws a fatal error if the error in unrecognized", async () => {
	const { api, custom } = createTestApi();
	let failed = false;

	class RandomError extends Error {}

	api.tell(
		setLoggerConfig((logger) => logger.mute()),
		setErrorHandler((error) => {
			if (
				error instanceof UnknownErrorCaught &&
				error.getUnknownError() instanceof RandomError
			) {
				failed = true;
			}
		}),
	);

	const getData = custom(
		throws(),
		factory(() => {
			throw new RandomError();
		}),
	);

	getData.execute().catch((e) => e);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});

test("it can be combined", async () => {
	const { custom } = createTestApi();
	let thrownTimes = 0;
	const caughtErrors: ApiError[] = [];

	class MyError1 extends ApiError {
		cloneSelf() {
			return new MyError1();
		}
	}

	class MyError2 extends ApiError {
		cloneSelf() {
			return new MyError2();
		}
	}

	class MyError3 extends ApiError {
		cloneSelf() {
			return new MyError3();
		}
	}

	const getData = custom(
		throws(MyError1),
		throws(MyError2, MyError3),
		factory(() => {
			thrownTimes++;

			switch (thrownTimes) {
				case 3:
					throw new MyError3();
				case 2:
					throw new MyError2();
				default:
					throw new MyError1();
			}
		}),
	);

	const catchError = (e: unknown) => {
		caughtErrors.push(e as any);
	};

	await getData.execute().catch((e) => catchError(e));
	await getData.execute().catch((e) => catchError(e));
	await getData.execute().catch((e) => catchError(e));

	await vi.waitFor(() => {
		caughtErrors[0] instanceof MyError1;
		caughtErrors[1] instanceof MyError2;
		caughtErrors[2] instanceof MyError3;
	});
});
