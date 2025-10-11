import { ApiError, as } from "@alette/pulse";
import { expect } from "@effect/vitest";
import { factory, input, runOnMount, throws } from "../../../domain";
import { IOneShotRequestState } from "../../../domain/execution/state/IOneShotRequestState";
import { createTestApi } from "../../utils";

class MyError extends ApiError {
	cloneSelf() {
		return new MyError();
	}
}

test("it keeps last used request settings unset before the request is executed", async () => {
	const { custom } = createTestApi();

	const value = "asdasdas";

	let lastSnapshot: IOneShotRequestState.AnyUnwrapped | null = null;
	const expectedArgs = { hey: "asdasd" };

	const getData1 = custom(
		input(as<typeof expectedArgs>()),
		throws(MyError),
		runOnMount(false),
		factory(() => {
			return value;
		}),
	).using(() => ({ args: expectedArgs }));

	const { when, getState, execute } = getData1.mount();

	when((snapshot) => {
		lastSnapshot = snapshot;
	});

	await vi.waitFor(async () => {
		expect(lastSnapshot?.settings).toEqual(null);
	});

	execute();
	await vi.waitFor(async () => {
		expect(lastSnapshot?.data).toEqual(value);
		expect(getState().data).toEqual(value);
		expect(getState().settings?.args).toEqual(expectedArgs);

		const snapshotSettings = lastSnapshot?.settings as { args: any } | null;
		expect(snapshotSettings?.args).toEqual(expectedArgs);
	});
});

test("it updates last used request settings after each reload", async () => {
	const { custom } = createTestApi();
	const value = "asdasdas";

	let executionCount = 0;
	let lastSnapshot: IOneShotRequestState.AnyUnwrapped | null = null;

	const expectedArgs1 = { hey: "asdasd" };
	const expectedArgs2 = { hey: "asdjkasbdjkasndkajsnd" };

	let args = expectedArgs1;

	const getData1 = custom(
		input(as<{ hey: string }>()),
		throws(MyError),
		runOnMount(false),
		factory(() => {
			if (!executionCount) {
				executionCount++;
				return value;
			}

			throw new MyError();
		}),
	).using(() => ({ args }));

	const { when, getState, execute } = getData1.mount();
	when((snapshot) => {
		lastSnapshot = snapshot;
	});

	await vi.waitFor(async () => {
		expect(lastSnapshot?.settings).toEqual(null);
	});

	execute();
	await vi.waitFor(async () => {
		expect(lastSnapshot?.data).toEqual(value);
		expect(getState().data).toEqual(value);
		expect(getState().settings?.args).toEqual(expectedArgs1);

		const snapshotSettings = lastSnapshot?.settings as { args: any } | null;
		expect(snapshotSettings?.args).toEqual(expectedArgs1);
	});

	args = expectedArgs2;

	execute();
	await vi.waitFor(async () => {
		expect(lastSnapshot?.error).toBeInstanceOf(MyError);

		expect(getState().error).toBeInstanceOf(MyError);
		expect(getState().settings?.args).toEqual(expectedArgs2);

		const snapshotSettings = lastSnapshot?.settings as { args: any } | null;
		expect(snapshotSettings?.args).toEqual(expectedArgs2);
	});
});
