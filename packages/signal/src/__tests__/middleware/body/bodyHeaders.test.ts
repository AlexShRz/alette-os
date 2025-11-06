import { body, factory, headers } from "../../../domain";
import { createTestApi } from "../../utils/createTestApi";

test("it merges body headers with user headers", async () => {
	const { custom } = createTestApi();
	const myBody = "asdasdaasd";
	const userHeaders1 = {
		heyy: "astst",
	};
	const userHeaders2 = {
		asdasd: "astst",
	};
	const expectedHeaders = {
		"Content-Type": "text/plain;charset=UTF-8",
	};
	let returned: any = null;

	const getData = custom(
		body(myBody),
		headers(userHeaders1),
		headers((_, prev) => ({ ...prev, ...userHeaders2 })),
		factory(({ body, headers }) => {
			returned = [body, headers];
			return true;
		}),
	);

	await getData();
	await vi.waitFor(() => {
		expect(returned[0]).toStrictEqual(myBody);
		expect(returned[1]).toStrictEqual({
			...userHeaders1,
			...userHeaders2,
			...expectedHeaders,
		});
	});
});

test("it does not override body headers if there is no collision with user headers", async () => {
	const { custom } = createTestApi();
	const myBody = "asdasdaasd";
	const userHeaders1 = {
		"other-header": "hello",
	};
	const expectedHeaders = {
		"Content-Type": "text/plain;charset=UTF-8",
		...userHeaders1,
	};
	let returned: any = null;

	const getData = custom(
		body(myBody),
		headers(userHeaders1),
		factory(({ body, headers }) => {
			returned = [body, headers];
			return true;
		}),
	);

	await getData();
	await vi.waitFor(() => {
		expect(returned[0]).toStrictEqual(myBody);
		expect(returned[1]).toStrictEqual(expectedHeaders);
	});
});

test("it allows user headers to override set body headers", async () => {
	const { custom } = createTestApi();
	const myBody = "asdasdaasd";
	const userHeaders1 = {
		"Content-Type": "application/octet-stream",
	};
	let returned: any = null;

	const getData = custom(
		body(myBody),
		headers(userHeaders1),
		factory(({ body, headers }) => {
			returned = [body, headers];
			return true;
		}),
	);

	await getData();
	await vi.waitFor(() => {
		expect(returned[0]).toStrictEqual(myBody);
		expect(returned[1]).toStrictEqual(userHeaders1);
	});
});
