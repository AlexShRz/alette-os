import { HeaderValidationError } from "@alette/pulse";
import { setErrorHandler } from "../../application";
import { factory, headers } from "../../domain";
import { createTestApi } from "../../shared/testUtils/createTestApi";

test("it sets headers", async () => {
	const { custom } = createTestApi();
	const myHeaders = {
		hey: "there",
	};

	const getData = custom(
		headers(myHeaders),
		factory(({ headers }) => {
			return headers;
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toStrictEqual(myHeaders);
	});
});

test("it can be combined", async () => {
	const { custom } = createTestApi();
	const myHeaders1 = {
		hey: "there",
	};
	const myHeaders2 = {
		asdasd: "asdasd",
	};
	const myHeaders3 = {
		aaaaa: "asdasd",
	};

	const getData = custom(
		headers(myHeaders1),
		headers((prev) => ({ ...prev, ...myHeaders2 })),
		headers(async (prev) => ({ ...prev, ...myHeaders3 })),
		factory(({ headers }) => {
			return headers;
		}),
	);

	const result = await getData.execute();

	await vi.waitFor(() => {
		expect(result).toStrictEqual({
			...myHeaders1,
			...myHeaders2,
			...myHeaders3,
		});
	});
});

test.each([
	[
		{
			// Set non-serializable headers
			asdas: () => {},
		},
	],
	["asdasd"],
	[21312],
])(
	"it throws a fatal error if the path is incorrect",
	async (invalidHeaders) => {
		const { api, custom } = createTestApi();
		let failed = false;

		api.tell(
			setErrorHandler((error) => {
				if (error instanceof HeaderValidationError) {
					failed = true;
				}
			}),
		);

		const getData = custom(
			// @ts-expect-error
			headers(invalidHeaders),
			factory(() => {
				return true;
			}),
		);

		getData.execute().catch((e) => e);

		await vi.waitFor(() => {
			expect(failed).toBeTruthy();
		});
	},
);
