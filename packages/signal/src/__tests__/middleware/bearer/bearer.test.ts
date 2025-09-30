import { RequestFailedError } from "@alette/pulse";
import { setContext } from "../../../application";
import { bearer, factory, retry } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils";

test("it replaces middleware of the same type", async () => {
	const { custom, cookie, token } = createTestApi();
	let reachedCookie = false;
	let reachedToken = false;

	const myCookie = cookie()
		.from(() => {
			reachedCookie = true;
		})
		.build();
	const myToken = token()
		.from(() => {
			reachedToken = true;
			return "asdasd";
		})
		.build();
	expect(await myCookie.isValid()).toBeFalsy();

	const getData = custom(
		bearer(myCookie),
		bearer(myToken),
		factory(() => {
			return "asd";
		}),
	);

	await getData.execute();
	expect(reachedCookie).toBeFalsy();
	expect(reachedToken).toBeTruthy();
});

test("it works together with retry", async () => {
	const { custom, cookie } = createTestApi();
	let triedTimes = 0;
	let loadedCookie = 0;
	const responseValue = "asdasdasd";

	const myCookie = cookie()
		.from(() => {
			loadedCookie++;
		})
		.build();
	expect(await myCookie.isValid()).toBeFalsy();

	const getData = custom(
		bearer(myCookie),
		factory(() => {
			if (!triedTimes) {
				triedTimes++;
				throw new RequestFailedError({
					status: 401,
				});
			}

			triedTimes++;
			return responseValue;
		}),
		retry({
			whenStatus: [401],
		}),
	);

	const res = await getData.execute();
	expect(res).toEqual(responseValue);
	expect(triedTimes).toEqual(2);
	/**
	 * Cookie load MUST be called twice:
	 * 1. During first request attempt we just load it.
	 * 2. When our request fails, the failure event must
	 * reach bearer() before retry() to allow for
	 * cookie invalidation.
	 * 3. Next, our cookie is loaded again and the
	 * request is retried
	 * */
	expect(loadedCookie).toEqual(2);
});

test("it can access global context", async () => {
	const { api, custom, cookie } = createTestApi();
	const context = { asdasdsa: "asdas" };
	api.tell(setContext(context));

	let caughtContext: any = null;

	const myCookie = cookie()
		.from(() => {})
		.build();
	expect(await myCookie.isValid()).toBeFalsy();

	const getData = custom(
		bearer(async ({ context }) => {
			caughtContext = context;
			return myCookie;
		}),
		factory(() => {
			return "asd";
		}),
	);

	await getData.execute();
	expect(caughtContext).toEqual(context);
});
