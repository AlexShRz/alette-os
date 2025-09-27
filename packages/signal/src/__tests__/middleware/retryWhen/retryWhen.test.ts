import { ApiError } from "@alette/pulse";
import { setContext } from "../../../application";
import {
	path,
	body,
	factory,
	mapError,
	output,
	reloadable,
	retryWhen,
	runOnMount,
	throws,
	type,
} from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

class MyError extends ApiError {
	cloneSelf() {
		return new MyError();
	}
}

class MyError2 extends ApiError {
	cloneSelf() {
		return new MyError2();
	}
}

test("it retries requests", async () => {
	const { custom } = createTestApi();
	const myResponse = "asda";
	let triedTimes = 0;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			if (!triedTimes) {
				triedTimes++;
				throw new MyError();
			}

			return myResponse;
		}),
		retryWhen(async () => {
			return true;
		}),
	);

	const res = await getData.execute();
	expect(res).toEqual(myResponse);
});

test("it counts retry attempts", async () => {
	const { custom } = createTestApi();
	const myResponse = "asda";
	let triedTimes = 0;
	let triedTimesFromMiddleware = 0;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			if (triedTimes < 3) {
				triedTimes++;
				throw new MyError();
			}

			return myResponse;
		}),
		retryWhen(({ attempt }) => {
			triedTimesFromMiddleware = attempt;
			return true;
		}),
	);

	await getData.execute();
	expect(triedTimesFromMiddleware).toEqual(triedTimes);
});

test("it can access context of a previously failed request", async () => {
	const { custom } = createTestApi();
	const myResponse = "asda";
	const path1 = "/heyy";
	const path2 = "/heyysdsds";
	const path3 = "/heyysss";
	const loggedPaths: string[] = [];

	let triedTimes = 0;

	const getData = custom(
		output(type<string>()),
		path(() => {
			switch (triedTimes) {
				case 2:
					return path3;
				case 1:
					return path2;
				default:
					return path1;
			}
		}),
		factory(() => {
			if (triedTimes < 3) {
				triedTimes++;
				throw new MyError();
			}

			return myResponse;
		}),
		retryWhen((_, { path }) => {
			loggedPaths.push(path);
			return true;
		}),
	);

	await getData.execute();
	expect(loggedPaths).toStrictEqual([path1, path2, path3]);
});

test("it can access request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));
	const myResponse = "asda";
	let triedTimes = 0;

	let caughtContext: typeof context | null = null;
	let caughtPath: string | null = null;

	const pathValue = "/asdads";

	const getData = custom(
		path(pathValue),
		body(async ({ context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
			return new Blob();
		}),
		factory(() => {
			if (!triedTimes) {
				triedTimes++;
				throw new MyError();
			}

			return myResponse;
		}),
		retryWhen((_, { context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
			return true;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
		expect(caughtPath).toBe(pathValue);
	});
});

test("it overrides middleware of the same type", async () => {
	const { custom } = createTestApi();
	const myResponse = "asda";
	let triedTimes = 0;
	let reachedPrevious = false;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			if (!triedTimes) {
				triedTimes++;
				throw new MyError();
			}

			return myResponse;
		}),
		retryWhen(() => {
			reachedPrevious = true;
			return true;
		}),
		retryWhen(async () => {
			return true;
		}),
	);

	const res = await getData.execute();
	expect(res).toEqual(myResponse);
	expect(reachedPrevious).toBeFalsy();
});

test("it is not affected by error mapping", async () => {
	const { custom } = createTestApi();
	const myResponse = "asda";
	let triedTimes = 0;
	let caughtError: MyError | null = null;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			if (!triedTimes) {
				triedTimes++;
				throw new MyError();
			}

			return myResponse;
		}),
		throws(MyError),
		mapError(() => new MyError2()),
		retryWhen(async ({ error }) => {
			caughtError = error;
			return true;
		}),
	);

	const res = await getData.execute();
	expect(res).toEqual(myResponse);
	expect(caughtError).toBeInstanceOf(MyError);
});

test("it allows users to disable retries per request", async () => {
	const { custom } = createTestApi();
	let enteredRetry = 0;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			throw new MyError();
		}),
		retryWhen(async () => {
			enteredRetry++;
			return true;
		}),
	);

	await expect(() => getData.execute({ skipRetry: true })).rejects.toThrowError(
		MyError,
	);
	expect(enteredRetry).toEqual(0);
});

test("it allows users to disable retries per request (mount mode)", async () => {
	const { custom } = createTestApi();
	let enteredRetry = 0;

	const getData = custom(
		output(type<string>()),
		runOnMount(false),
		reloadable(() => true),
		factory(() => {
			throw new MyError();
		}),
		retryWhen(async () => {
			enteredRetry++;
			return enteredRetry <= 1;
		}),
	);

	const { execute, getState } = getData.mount();

	execute({ skipRetry: true });
	await vi.waitFor(() => {
		expect(getState().error).toBeInstanceOf(MyError);
		expect(enteredRetry).toEqual(0);
	});

	execute({ skipRetry: false });
	await vi.waitFor(() => {
		expect(getState().error).toBeInstanceOf(MyError);
		expect(enteredRetry).toEqual(2);
	});
});
