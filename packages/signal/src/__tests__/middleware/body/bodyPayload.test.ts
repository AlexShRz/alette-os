import { body, factory } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it sets headers and body for plain text transfer", async () => {
	const { custom } = createTestApi();
	const myBody = "asdasdaasd";
	const expectedHeaders = {
		"Content-Type": "text/plain;charset=UTF-8",
	};
	let returned: any = null;

	const getData = custom(
		body(myBody),
		factory(({ body, headers }) => {
			returned = [body, headers];
			return true;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(returned[0]).toStrictEqual(myBody);
		expect(returned[1]).toStrictEqual(expectedHeaders);
	});
});

test("it sets headers and body for json transfer", async () => {
	const { custom } = createTestApi();
	const myBody = {};
	const expectedHeaders = {
		"Content-Type": "application/json;charset=UTF-8",
	};
	let returned: any = null;

	const getData = custom(
		body(myBody),
		factory(({ body, headers }) => {
			returned = [body, headers];
			return true;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(returned[0]).toStrictEqual(myBody);
		expect(returned[1]).toStrictEqual(expectedHeaders);
	});
});

test("it sets headers and body for encoded url transfer", async () => {
	const { custom } = createTestApi();
	const myBody = new URLSearchParams();
	const expectedHeaders = {
		"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
	};
	let returned: any = null;

	const getData = custom(
		body(myBody),
		factory(({ body, headers }) => {
			returned = [body, headers];
			return true;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(returned[0]).toStrictEqual(myBody);
		expect(returned[1]).toStrictEqual(expectedHeaders);
	});
});

test("it sets body payload only for form data transfer", async () => {
	const { custom } = createTestApi();
	const myBody = new FormData();
	const expectedHeaders = {};
	let returned: any = null;

	const getData = custom(
		body(myBody),
		factory(({ body, headers }) => {
			returned = [body, headers];
			return true;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(returned[0]).toStrictEqual(myBody);
		expect(returned[1]).toStrictEqual(expectedHeaders);
	});
});

test("it sets headers and body for blob transfer", async () => {
	const { custom } = createTestApi();
	const myBody = new Blob();
	const expectedHeaders = {
		"Content-Type": "application/octet-stream",
	};
	let returned: any = null;

	const getData = custom(
		body(myBody),
		factory(({ body, headers }) => {
			returned = [body, headers];
			return true;
		}),
	);

	await getData.execute();
	await vi.waitFor(() => {
		expect(returned[0]).toStrictEqual(myBody);
		expect(returned[1]).toStrictEqual(expectedHeaders);
	});
});

test.each([[new Uint8Array()], [new ArrayBuffer()]])(
	"it sets headers and body for byte transfer",
	async () => {
		const { custom } = createTestApi();
		const myBody = new Blob();
		const expectedHeaders = {
			"Content-Type": "application/octet-stream",
		};
		let returned: any = null;

		const getData = custom(
			body(myBody),
			factory(({ body, headers }) => {
				returned = [body, headers];
				return true;
			}),
		);

		await getData.execute();
		await vi.waitFor(() => {
			expect(returned[0]).toStrictEqual(myBody);
			expect(returned[1]).toStrictEqual(expectedHeaders);
		});
	},
);
