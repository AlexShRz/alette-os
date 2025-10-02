import { createTestApi } from "../utils";

test("it deduplicates requests for token refresh", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	let calledTimes = 0;

	const myToken = token()
		.from(async () => {
			calledTimes++;
			return tokenValue;
		})
		.build();

	await Promise.all([
		myToken.get(),
		myToken.get(),
		myToken.get(),
		myToken.get(),
		myToken.get(),
		myToken.get(),
		myToken.get(),
		myToken.get(),
		myToken.get(),
		myToken.get(),
		myToken.get(),
		myToken.get(),
	]);

	expect(await myToken.get()).toEqual(tokenValue);
	expect(calledTimes).toEqual(1);
});

test("it does not block users from getting other tokens", async () => {
	const { token } = createTestApi();
	const tokenValue1 = "asdasjkdh";
	const tokenValue2 = "213123";
	let reachedFirst = false;

	const myToken1 = token()
		.from(async () => {
			reachedFirst = true;
			return new Promise(() => {
				// never resolve
			});
		})
		.build();
	const myToken2 = token()
		.from(async () => {
			return tokenValue1;
		})
		.build();
	const myToken3 = token()
		.from(async () => {
			return tokenValue2;
		})
		.build();

	// Start token refresh that never resolves
	myToken1.get().catch((e) => e);
	await vi.waitFor(() => {
		expect(reachedFirst).toBeTruthy();
	});

	expect(await myToken2.get()).toEqual(tokenValue1);
	expect(await myToken3.get()).toEqual(tokenValue2);
});
