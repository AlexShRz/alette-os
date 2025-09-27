import { RequestFailedError, THttpStatusCode } from "@alette/pulse";
import { beforeEach } from "@effect/vitest";
import { factory, output, retry, type } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils";

beforeEach(() => {
	vi.useRealTimers();
});

test("it skips status related logic if the error does not contain statuses", async () => {
	const { custom } = createTestApi();
	let enteredTimes = 0;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			enteredTimes++;
			/**
			 * Use errors recognized by retry() here
			 * */
			throw new RequestFailedError();
		}),
		retry({
			times: 2,
			unlessStatus: [400],
		}),
	);

	try {
		await getData.execute();
	} catch {}

	expect(enteredTimes).toEqual(3);
});

test.each([
	[400, false],
	[500, false],
	[302, false],
	[403, true],
])(
	"it does not retry requests if their errors contain statuses from the list",
	async (status, shouldBeRetried) => {
		const { custom } = createTestApi();
		let enteredTimes = 0;

		const getData = custom(
			output(type<string>()),
			factory(() => {
				enteredTimes++;
				/**
				 * Use errors recognized by retry() here
				 * */
				throw new RequestFailedError({
					status: status as THttpStatusCode,
				});
			}),
			retry({
				times: 5,
				unlessStatus: [400, 500, 302],
			}),
		);

		try {
			await getData.execute();
		} catch {}

		if (shouldBeRetried) {
			expect(enteredTimes).toEqual(6);
		} else {
			expect(enteredTimes).toEqual(1);
		}
	},
);
