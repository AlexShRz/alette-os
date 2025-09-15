import { ApiException } from "@alette/pulse";
import { setContext } from "../../application";
import {
	path,
	factory,
	reloadable,
	runOnMount,
	tap,
	throws,
} from "../../domain";
import { createTestApi } from "../../shared/testUtils/createTestApi";

class MyError extends ApiException.As("MyError") {
	cloneSelf() {
		return new MyError();
	}
}

test("it is triggered on request success", async () => {
	const { custom } = createTestApi();
	const logger: any[] = [];
	const myResponse = "asda";

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		tap(async (response) => {
			logger.push(response);
		}),
		factory(() => {
			return myResponse;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(logger[0]).toEqual(myResponse);
	});
});

test("it can access request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));
	const myResponse = "asda";

	let caughtContext: typeof context | null = null;
	let caughtPath: string | null = null;

	const pathValue = "/asdads";

	const getData = custom(
		path(pathValue),
		runOnMount(false),
		reloadable(() => true),
		tap(async (_, { context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
		}),
		factory(() => {
			return myResponse;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(caughtContext).toBe(context);
		expect(caughtPath).toBe(pathValue);
	});
});

test("it can be combined", async () => {
	const { custom } = createTestApi();
	const logged: number[] = [];
	const myResponse = "asda";

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		throws(MyError),
		tap(async () => {
			logged.push(1);
		}),
		factory(() => {
			return myResponse;
		}),
		tap(async () => {
			logged.push(2);
		}),
		tap(() => {
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
