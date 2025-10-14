import { createTestApi } from "../utils";

test("it stores refresh tokens", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	const refreshTokenValue = "asaaaa";

	const logged: any[] = [];

	const myToken = token()
		.from(async ({ prevToken, refreshToken }) => {
			logged.push(prevToken, refreshToken);
			return { token: tokenValue, refreshToken: refreshTokenValue };
		})
		.build();

	const value = await myToken.get();

	expect(value).toEqual(tokenValue);
	expect(logged[0]).toEqual("");
	expect(logged[1]).toEqual(null);

	const value2 = await myToken.refreshAndGet();
	expect(value2).toEqual(tokenValue);
	expect(logged[2]).toEqual(tokenValue);
	expect(logged[3]).toEqual(refreshTokenValue);
});

test("it resets refresh tokens if an error is thrown", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	const refreshTokenValue = "asaaaa";
	let triggered = 0;

	const logged: any[] = [];

	const myToken = token()
		.from(async ({ prevToken, refreshToken }) => {
			logged.push(prevToken, refreshToken);

			if (triggered > 1) {
				throw new Error("Failed to refresh token");
			}

			triggered++;
			return { token: tokenValue, refreshToken: refreshTokenValue };
		})
		.build();

	const value = await myToken.get();

	expect(value).toEqual(tokenValue);
	expect(logged[0]).toEqual("");
	expect(logged[1]).toEqual(null);

	const value2 = await myToken.refreshAndGet();
	expect(value2).toEqual(tokenValue);
	expect(logged[2]).toEqual(tokenValue);
	expect(logged[3]).toEqual(refreshTokenValue);

	const value3 = await myToken.refreshAndGet();
	expect(value3).toEqual(tokenValue);
	expect(await myToken.isValid()).toBeFalsy();
	expect(logged[4]).toEqual(tokenValue);
	expect(logged[5]).toEqual(refreshTokenValue);

	const value4 = await myToken.refreshAndGet();
	expect(value4).toEqual(tokenValue);
	expect(await myToken.isValid()).toBeFalsy();
	expect(logged[6]).toEqual(tokenValue);
	expect(logged[7]).toEqual(null);
});

test("it resets refresh tokens if a string is returned", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";
	const refreshTokenValue = "asaaaa";
	let triggered = 0;

	const logged: any[] = [];

	const myToken = token()
		.from(async ({ prevToken, refreshToken }) => {
			logged.push(prevToken, refreshToken);

			if (triggered > 1) {
				return tokenValue;
			}

			triggered++;
			return { token: tokenValue, refreshToken: refreshTokenValue };
		})
		.build();

	const value = await myToken.get();
	expect(value).toEqual(tokenValue);
	expect(logged[0]).toEqual("");
	expect(logged[1]).toEqual(null);

	const value2 = await myToken.refreshAndGet();
	expect(value2).toEqual(tokenValue);
	expect(logged[2]).toEqual(tokenValue);
	expect(logged[3]).toEqual(refreshTokenValue);

	const value3 = await myToken.refreshAndGet();
	expect(value3).toEqual(tokenValue);
	expect(logged[4]).toEqual(tokenValue);
	expect(logged[5]).toEqual(refreshTokenValue);

	const value4 = await myToken.refreshAndGet();
	expect(value4).toEqual(tokenValue);
	expect(logged[6]).toEqual(tokenValue);
	expect(logged[7]).toEqual(null);
});
