import { Subject } from "rxjs";
import { factory, synchronized, tap } from "../../../domain";
import { createTestApi } from "../../utils";

test("it marks single middleware branch as a leader and only executes its middleware", async () => {
	const { custom } = createTestApi();
	const trigger = new Subject<string>();
	const value = "asdasdasd";
	let triggeredTimes = 0;

	const getData = custom(
		synchronized(),
		factory(async () => {
			return await new Promise<string>((res) => {
				trigger.subscribe({
					next: (v) => {
						res(v);
					},
				});
			});
		}),
		tap(() => {
			triggeredTimes++;
		}),
	);

	const inst1 = getData.mount();
	inst1.execute();

	const inst2 = getData.mount();

	await vi.waitFor(() => {
		expect(inst1.getState().isLoading).toBeTruthy();
	});

	// Add late request
	const inst3 = getData.mount();
	await vi.waitFor(() => {
		expect(inst3.getState().isLoading).toBeTruthy();
	});

	trigger.next(value);
	await vi.waitFor(() => {
		expect(inst1.getState().data).toEqual(value);
		expect(inst2.getState().data).toEqual(value);
		expect(inst3.getState().data).toEqual(value);
	});

	expect(triggeredTimes).toEqual(1);
});
