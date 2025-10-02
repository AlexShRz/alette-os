import { ApiError } from "@alette/pulse";
import { setContext } from "../../../application";
import {
	path,
	factory,
	reloadable,
	runOnMount,
	tapError,
	throws,
} from "../../../domain";
import { createTestApi } from "../../utils/createTestApi";

class MyError extends ApiError {
	cloneSelf() {
		return new MyError();
	}
}

test("it is triggered on request error", async () => {
	const { custom } = createTestApi();
	const logger: MyError[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		throws(MyError),
		tapError(async (error) => {
			logger.push(error);
		}),
		factory(() => {
			throw new MyError();
		}),
	);

	const { reload, execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logger[0] instanceof MyError).toBeTruthy();
	});
	reload();
	await vi.waitFor(() => {
		expect(logger[1] instanceof MyError).toBeTruthy();
	});

	getData.execute().catch(() => {});
	await vi.waitFor(() => {
		expect(logger[2] instanceof MyError).toBeTruthy();
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
		tapError(async (_, { context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
		}),
		factory(() => {
			throw new MyError();
		}),
	);

	getData.execute().catch(() => {});
	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
		expect(caughtPath).toBe(pathValue);
	});
});

test("it can be combined", async () => {
	const { custom } = createTestApi();
	const logged: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		throws(MyError),
		tapError(async () => {
			logged.push(1);
		}),
		factory(() => {
			throw new MyError();
		}),
		tapError(async () => {
			logged.push(2);
		}),
		tapError(() => {
			logged.push(3);
		}),
	);

	const { reload, execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logged).toStrictEqual([1, 2, 3]);
	});
	reload();
	await vi.waitFor(() => {
		expect(logged).toStrictEqual([1, 2, 3, 1, 2, 3]);
	});

	getData.execute().catch(() => {});
	await vi.waitFor(() => {
		expect(logged).toStrictEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
	});
});
