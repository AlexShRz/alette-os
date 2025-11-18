import { wait } from "../shared";

test('it returns "true" for compatibility with middleware', async () => {
	expect(await wait(0)).toEqual(true);
});
