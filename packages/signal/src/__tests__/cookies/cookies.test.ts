import { createTestApi } from "../utils";

test("it fetches new cookie when called for the first time", async () => {
	const { cookie } = createTestApi();
	let wasTriggered = 0;

	const myCookie = cookie()
		.from(async () => {
			wasTriggered++;
		})
		.build();

	await myCookie.load();
	expect(wasTriggered).toEqual(1);
});

test("it fetches cookies if they were marked as invalid", async () => {
	const { cookie } = createTestApi();
	let wasTriggered = 0;

	const myCookie = cookie()
		.from(async () => {
			wasTriggered++;
		})
		.build();

	await myCookie.load();
	// Nothing should be done here
	await myCookie.load();
	await myCookie.load();

	await vi.waitFor(() => {
		expect(wasTriggered).toEqual(1);
	});

	myCookie.invalidate();
	await myCookie.load();

	expect(wasTriggered).toEqual(2);

	/**
	 * Make sure our cookie stays valid
	 * */
	await myCookie.load();
	await myCookie.load();
	await myCookie.load();
	await vi.waitFor(() => {
		expect(wasTriggered).toEqual(2);
	});
});

test("it invalidates cookies without refreshing them", async () => {
	const { cookie } = createTestApi();
	let wasTriggered = 0;

	const myCookie = cookie()
		.from(async () => {
			wasTriggered++;
		})
		.build();

	await myCookie.load();
	expect(wasTriggered).toEqual(1);

	myCookie.invalidate();
	const isValid = await myCookie.isValid();

	await vi.waitFor(() => {
		expect(isValid).toBeFalsy();
		expect(wasTriggered).toEqual(1);
	});
});

test("it refreshes valid cookies manually", async () => {
	const { cookie } = createTestApi();
	let wasTriggered = 0;

	const myCookie = cookie()
		.from(async () => {
			wasTriggered++;
		})
		.build();

	await myCookie.load();
	expect(wasTriggered).toEqual(1);

	expect(await myCookie.isValid()).toBeTruthy();
	myCookie.refresh();

	await vi.waitFor(() => {
		expect(wasTriggered).toEqual(2);
	});
});

test("it marks cookie as invalid if an error was thrown during refresh", async () => {
	const { cookie } = createTestApi();
	let wasTriggered = 0;

	const myCookie = cookie()
		.from(async () => {
			if (!!wasTriggered) {
				throw new Error();
			}

			wasTriggered++;
		})
		.build();

	await myCookie.load();
	expect(wasTriggered).toEqual(1);
	expect(await myCookie.isValid()).toBeTruthy();

	myCookie.refresh();
	await vi.waitFor(async () => {
		expect(await myCookie.isValid()).toBeFalsy();
		expect(wasTriggered).toEqual(1);
	});
});

test("it allows cookie supplier override", async () => {
	const { cookie } = createTestApi();
	let triggered = 0;

	const myCookie = cookie()
		.from(async () => {
			triggered++;
		})
		.build();

	myCookie.from(async () => {
		triggered++;
	});

	await myCookie.load();
	expect(triggered).toEqual(1);
});

/**
 * Useful if we want to store some
 * data in api context. The id
 * can be used to identify data tied to a
 * specific cookie.
 * */
test("it exposes static cookie id", async () => {
	const { cookie } = createTestApi();
	let triggered = 0;
	let logged1: string | null = null;
	let logged2: string | null = null;

	const myCookie = cookie()
		.from(async ({ id }) => {
			if (!triggered) {
				logged1 = id;
			} else {
				logged2 = id;
			}

			triggered++;
		})
		.build();

	await myCookie.load();
	expect(triggered).toEqual(1);

	myCookie.refresh();
	await vi.waitFor(() => {
		expect(triggered).toEqual(2);
		expect(logged1).toEqual(logged2);
	});
});
