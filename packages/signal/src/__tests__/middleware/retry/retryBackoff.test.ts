import { ApiError, type } from "@alette/pulse";
import { beforeEach } from "@effect/vitest";
import { factory, output, retry } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils";

class MyError extends ApiError {
	cloneSelf() {
		return new MyError();
	}
}

beforeEach(() => {
	vi.useRealTimers();
});

test("it uses last backoff value as a timeout if retry limit exceeds the amount of backoff values", async () => {
	const { api, custom } = createTestApi();
	let enteredTimes = 0;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			enteredTimes++;
			throw new MyError();
		}),
		retry({
			times: 4,
			backoff: [0, "20 seconds"],
		}),
	);

	vi.useFakeTimers();
	const { execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(1);
	});

	await api.timeTravel("15 seconds");
	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(2);
	});

	await api.timeTravel("2 seconds");
	// Nothing should happen
	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(2);
	});

	await api.timeTravel("5 seconds");
	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(3);
	});

	await api.timeTravel("20 seconds");
	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(4);
	});
});

test("it syncs current backoff value with current retry attempt", async () => {
	const { api, custom } = createTestApi();
	let enteredTimes = 0;

	const getData = custom(
		output(type<string>()),
		factory(() => {
			enteredTimes++;
			throw new MyError();
		}),
		retry({
			times: 5,
			backoff: [1000, 5000, 10000, 15000, 20000],
		}),
	);

	vi.useFakeTimers();
	const { execute } = getData.mount();
	execute();

	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(1);
	});

	await api.timeTravel(1000);
	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(2);
	});

	await api.timeTravel(2000);
	// Nothing should happen
	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(2);
	});

	await api.timeTravel(3000);
	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(3);
	});

	await api.timeTravel(10000);
	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(4);
	});

	await api.timeTravel(15000);
	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(5);
	});

	await api.timeTravel(20000);
	await vi.waitFor(() => {
		expect(enteredTimes).toEqual(6);
	});
});

test.each([[[]], [undefined]])(
	"it does not add delays in between retries if backoff values were not provided",
	async (backoff) => {
		const { custom } = createTestApi();
		let enteredTimes = 0;

		const getData = custom(
			output(type<string>()),
			factory(() => {
				enteredTimes++;
				throw new MyError();
			}),
			retry({
				backoff: backoff,
			}),
		);

		try {
			await getData.execute();
		} catch {}

		await vi.waitFor(() => {
			expect(enteredTimes).toEqual(2);
		});
	},
);
