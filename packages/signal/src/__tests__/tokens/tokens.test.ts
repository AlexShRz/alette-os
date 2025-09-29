import { createTestApi } from "../../shared/testUtils";

test("it fetches new token when called for the first time", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	let wasTriggered = 0;

	const myToken = token()
		.from(async () => {
			wasTriggered++;
			return tokenValue;
		})
		.build();

	const value = await myToken.get();

	expect(value).toEqual(tokenValue);
	expect(wasTriggered).toEqual(1);
});

test("it fetches tokens if they were marked as invalid", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	let wasTriggered = 0;

	const myToken = token()
		.from(async () => {
			wasTriggered++;
			return tokenValue;
		})
		.build();

	await myToken.get();
	// Nothing should be done here
	await myToken.get();
	await myToken.get();

	await vi.waitFor(() => {
		expect(wasTriggered).toEqual(1);
	});

	myToken.invalidate();
	const value = await myToken.get();

	expect(value).toEqual(tokenValue);
	expect(wasTriggered).toEqual(2);

	/**
	 * Make sure our token stays valid
	 * */
	await myToken.get();
	await myToken.get();
	await myToken.get();
	await vi.waitFor(() => {
		expect(wasTriggered).toEqual(2);
	});
});

test("it invalidates tokens without refreshing them", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	let wasTriggered = 0;

	const myToken = token()
		.from(async () => {
			wasTriggered++;
			return tokenValue;
		})
		.build();

	await myToken.get();
	expect(wasTriggered).toEqual(1);

	myToken.invalidate();
	const isValid = await myToken.isValid();

	await vi.waitFor(() => {
		expect(isValid).toBeFalsy();
		expect(wasTriggered).toEqual(1);
	});
});

test("it refreshes valid tokens manually", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	let wasTriggered = 0;

	const myToken = token()
		.from(async () => {
			wasTriggered++;
			return tokenValue;
		})
		.build();

	await myToken.get();
	expect(wasTriggered).toEqual(1);

	expect(await myToken.isValid()).toBeTruthy();
	myToken.refresh();

	await vi.waitFor(() => {
		expect(wasTriggered).toEqual(2);
	});
});

test("it marks token as invalid if an error was thrown during refresh", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	let wasTriggered = 0;

	const myToken = token()
		.from(async () => {
			if (!!wasTriggered) {
				throw new Error();
			}

			wasTriggered++;
			return tokenValue;
		})
		.build();

	await myToken.get();
	expect(wasTriggered).toEqual(1);
	expect(await myToken.isValid()).toBeTruthy();

	myToken.refresh();
	await vi.waitFor(async () => {
		expect(await myToken.isValid()).toBeFalsy();
		expect(wasTriggered).toEqual(1);
	});
});

test("it allows token supplier override", async () => {
	const { token } = createTestApi();
	const tokenValue = "343423";

	const myToken = token()
		.from(async () => {
			return "asdsad";
		})
		.build();

	myToken.from(async () => tokenValue);

	expect(await myToken.get()).toEqual(tokenValue);
});
