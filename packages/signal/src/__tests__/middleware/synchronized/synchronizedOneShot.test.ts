import { Subject } from "rxjs";
import { factory, reloadable, runOnMount, synchronized } from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it does not synchronize one shot requests", async () => {
	const { custom } = createTestApi();
	const trigger = new Subject<string>();
	const value = "asdasd";
	let ranTimes = 0;
	const logged: any[] = [];

	const getData = custom(
		synchronized(),
		runOnMount(false),
		reloadable(() => true),
		factory(async () => {
			ranTimes++;
			return await new Promise<string>((res) => {
				trigger.subscribe({
					next: (v) => {
						res(v);
					},
				});
			});
		}),
	);

	getData.execute().then((v) => {
		logged.push(v);
	});
	getData.execute().then((v) => {
		logged.push(v);
	});
	getData.execute().then((v) => {
		logged.push(v);
	});

	await vi.waitFor(() => {
		expect(ranTimes).toEqual(3);
	});

	trigger.next(value);

	await vi.waitFor(() => {
		expect(logged).toStrictEqual([value, value, value]);
		expect(ranTimes).toEqual(3);
	});
});
