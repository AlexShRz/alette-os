import { createTestApi } from "../../shared/testUtils";

test("it deduplicates requests for cookie refresh", async () => {
	const { cookie } = createTestApi();
	let calledTimes = 0;

	const myCookie = cookie()
		.from(async () => {
			calledTimes++;
		})
		.build();

	await Promise.all([
		myCookie.load(),
		myCookie.load(),
		myCookie.load(),
		myCookie.load(),
		myCookie.load(),
		myCookie.load(),
		myCookie.load(),
		myCookie.load(),
		myCookie.load(),
		myCookie.load(),
		myCookie.load(),
		myCookie.load(),
	]);

	await myCookie.load();
	expect(calledTimes).toEqual(1);
});

test("it does not block users from getting other cookies", async () => {
	const { cookie } = createTestApi();
	let reachedFirst = false;
	let reachedSecond = false;
	let reachedThird = false;

	const myCookie1 = cookie()
		.from(async () => {
			reachedFirst = true;
			return new Promise(() => {
				// never resolve
			});
		})
		.build();
	const myCookie2 = cookie()
		.from(async () => {
			reachedSecond = true;
		})
		.build();
	const myCookie3 = cookie()
		.from(async () => {
			reachedThird = true;
		})
		.build();

	// Start cookie refresh that never resolves
	myCookie1.load().catch((e) => e);
	await vi.waitFor(() => {
		expect(reachedFirst).toBeTruthy();
	});

	await myCookie2.load();
	expect(reachedSecond).toBeTruthy();
	await myCookie3.load();
	expect(reachedThird).toBeTruthy();
});
