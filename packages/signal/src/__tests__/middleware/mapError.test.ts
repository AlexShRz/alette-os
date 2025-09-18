import { ApiError } from "@alette/pulse";
import { setContext, setErrorHandler } from "../../application";
import {
	path,
	InvalidErrorMappingError,
	factory,
	mapError,
	reloadable,
	runOnMount,
	throws,
} from "../../domain";
import { createTestApi } from "../../shared/testUtils/createTestApi";

class MyError extends ApiError {
	constructor(protected customMessage: string) {
		super();
	}

	getCustomMessage() {
		return this.customMessage;
	}

	setCustomMessage(message: string) {
		this.customMessage = message;
		return this;
	}

	cloneSelf() {
		return new MyError(this.customMessage);
	}
}

class MyError2 extends ApiError {
	constructor(protected customMessage: string) {
		super();
	}

	getCustomMessage() {
		return this.customMessage;
	}

	cloneSelf() {
		return new MyError2(this.customMessage);
	}
}

test("it can map errors", async () => {
	const { custom } = createTestApi();
	const errorMessage = "asda";
	const suffix = "asdasdadasdasdasd";
	const expected = `${errorMessage}${suffix}`;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		throws(MyError),
		factory(() => {
			throw new MyError(errorMessage);
		}),
		mapError((error) =>
			error.setCustomMessage(`${error.getCustomMessage()}${suffix}`),
		),
	);

	try {
		await getData.execute();
	} catch (error) {
		expect((error as MyError).getCustomMessage()).toEqual(expected);
	}

	const { getState, execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		const error = getState().error;
		expect(error).toBeInstanceOf(MyError);
		expect((error as MyError).getCustomMessage()).toEqual(expected);
	});
});

test("it can be composed", async () => {
	const { custom } = createTestApi();
	const errorMessage = "asda";
	const suffix = "asdasdadasdasdasd";
	const expected = `${errorMessage}${suffix}`;

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		throws(MyError),
		factory(() => {
			throw new MyError(errorMessage);
		}),
		mapError((error) =>
			error.setCustomMessage(`${error.getCustomMessage()}${suffix}`),
		),
		mapError((error) => new MyError2(error.getCustomMessage())),
	);

	try {
		await getData.execute();
	} catch (error) {
		expect((error as MyError2).getCustomMessage()).toEqual(expected);
	}

	const { getState, execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		const error = getState().error;
		expect(error).toBeInstanceOf(MyError2);
		expect((error as MyError2).getCustomMessage()).toEqual(expected);
	});
});

test("it can access request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));

	let caughtContext: typeof context | null = null;
	let caughtPath: string | null = null;

	const pathValue = "/asdads";

	const getData = custom(
		path(pathValue),
		runOnMount(false),
		reloadable(() => true),
		throws(MyError),
		factory(() => {
			throw new MyError("");
		}),
		mapError(async (error, { context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
			return error;
		}),
	);

	await expect(() => getData.execute()).rejects.toBeInstanceOf(MyError);
	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
		expect(caughtPath).toBe(pathValue);
	});
});

test("it throws a fatal error if an incorrect error type is returned", async () => {
	const { api, custom } = createTestApi();
	let failed = false;

	class RandomError extends Error {}

	api.tell(
		setErrorHandler((error) => {
			if (
				error instanceof InvalidErrorMappingError &&
				error.getInvalidError() instanceof RandomError
			) {
				failed = true;
			}
		}),
	);

	const getData = custom(
		throws(MyError),
		factory(() => {
			throw new MyError("");
		}),
		// @ts-expect-error
		mapError((_) => {
			return new RandomError();
		}),
	);

	getData.execute().catch((e) => e);

	await vi.waitFor(() => {
		expect(failed).toBeTruthy();
	});
});
