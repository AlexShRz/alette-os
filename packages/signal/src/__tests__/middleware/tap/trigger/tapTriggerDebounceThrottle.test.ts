import {
	debounce,
	factory,
	reloadable,
	runOnMount,
	tapTrigger,
	throttle,
} from "../../../../domain";
import { createTestApi } from "../../../utils";

test("it is not affected by debounce", async () => {
	const { custom } = createTestApi();
	const logger: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		debounce("20 seconds"),
		factory(() => {
			return true;
		}),
		tapTrigger(() => {
			logger.push(1);
		}),
	);

	const { execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1]);
	});

	await getData.execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1, 1]);
	});
});

test("it is not affected by throttle", async () => {
	const { custom } = createTestApi();
	const logger: number[] = [];

	const getData = custom(
		runOnMount(false),
		reloadable(() => true),
		throttle("20 seconds"),
		factory(() => {
			return true;
		}),
		tapTrigger(() => {
			logger.push(1);
		}),
	);

	const { execute } = getData.mount();

	execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1]);
	});

	await getData.execute();
	await vi.waitFor(() => {
		expect(logger).toStrictEqual([1, 1]);
	});
});
