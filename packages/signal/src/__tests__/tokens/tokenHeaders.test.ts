import { setContext } from "../../application";
import { createTestApi } from "../utils";

test("it converts token to headers", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";

	const myToken = token()
		.from(async () => {
			return tokenValue;
		})
		.whenConvertedToHeaders(({ token }) => ({
			hey: token,
		}))
		.build();

	expect(await myToken.toHeaders()).toEqual({
		hey: tokenValue,
	});
});

test("it uses default bearer header when converting token to headers", async () => {
	const { token } = createTestApi();
	const tokenValue = "asdasjkdh";

	const myToken = token()
		.from(async () => {
			return tokenValue;
		})
		.build();

	expect(await myToken.toHeaders()).toEqual({
		Authorization: `Bearer ${tokenValue}`,
	});
});

test("it can access global context", async () => {
	const { api, token } = createTestApi();
	const tokenValue = "asdasjkdh";
	const context = { asdasdnasd: "asdas" };
	api.tell(setContext(context));

	let caughtContext: typeof context | null = null;

	const myToken = token()
		.from(async () => {
			return tokenValue;
		})
		.whenConvertedToHeaders(({ token, context }) => {
			caughtContext = context as any;
			return {
				hey: token,
			};
		})
		.build();

	expect(await myToken.toHeaders()).toEqual({
		hey: tokenValue,
	});
	expect(caughtContext).toEqual(context);
});
