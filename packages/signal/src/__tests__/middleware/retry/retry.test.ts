import { ApiError, type } from "@alette/pulse";
import { factory, output, retry, retryWhen } from "../../../domain";
import { createTestApi } from "../../utils";

class MyError extends ApiError {
	cloneSelf() {
		return new MyError();
	}
}

test("it retries requests using the specified retry limit", async () => {
	const { custom } = createTestApi();
	let enteredTimes = 0;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			enteredTimes++;
			throw new MyError();
		}),
		retry({
			times: 3,
		}),
	);

	try {
		await getData.execute();
	} catch {}

	expect(enteredTimes).toEqual(4);
});

test("it retries request once if retry limit is not specified", async () => {
	const { custom } = createTestApi();
	let enteredFactory = 0;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			enteredFactory++;
			throw new MyError();
		}),
		retry(),
	);

	try {
		await getData.execute();
	} catch {}

	expect(enteredFactory).toEqual(2);
});

test("it allows users to disable retries", async () => {
	const { custom } = createTestApi();
	let enteredFactory = 0;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			enteredFactory++;
			throw new MyError();
		}),
		retry(),
	);

	await expect(() =>
		getData.execute({ skipRetry: true }),
	).rejects.toBeInstanceOf(MyError);
	expect(enteredFactory).toEqual(1);
});

test("it overrides middleware of the same type", async () => {
	const { custom } = createTestApi();
	let enteredFactory = 0;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			enteredFactory++;
			throw new MyError();
		}),
		retry({
			times: 5,
		}),
		retry({
			times: 1,
		}),
	);

	await expect(() => getData.execute()).rejects.toBeTruthy();
	expect(enteredFactory).toEqual(2);
});

test("it overrides 'retryWhen' middleware", async () => {
	const { custom } = createTestApi();
	let enteredFactory = 0;
	let enteredRetryWhen = false;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			enteredFactory++;
			throw new MyError();
		}),
		retryWhen(() => {
			enteredRetryWhen = true;
			return true;
		}),
		retry({
			times: 1,
		}),
	);

	await expect(() => getData.execute()).rejects.toBeTruthy();
	expect(enteredFactory).toEqual(2);
	expect(enteredRetryWhen).toBeFalsy();
});
