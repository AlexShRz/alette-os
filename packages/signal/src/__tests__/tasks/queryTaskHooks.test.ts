import { expect, vi } from "@effect/vitest";
import { Cause, Data, Effect as E } from "effect";
import { queryTask } from "../../tasks/primitive/functions.js";

test("it runs hooks on success", async () => {
	const logged: number[] = [];

	const getValue = queryTask(() =>
		E.gen(function* () {
			return 1;
		}),
	)
		.whenSucceeded((value) => {
			logged.push(value);
		})
		.whenSucceeded((value) => {
			logged.push(value + 1);
		})
		.whenSucceeded((value) => {
			logged.push(value + 2);
		})
		.build();

	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());

	await vi.waitFor(() => {
		expect(logged).toStrictEqual([1, 2, 3]);
	});
});

test("it runs hooks on failure", async () => {
	class MyError extends Data.TaggedError("MyError") {}

	const logged: unknown[] = [];

	const getValue = queryTask(() =>
		E.gen(function* () {
			yield* new MyError();
		}),
	)
		.whenFailed((error) => {
			logged.push(error);
		})
		.whenFailed((error) => {
			logged.push(error);
		})
		.whenFailed((error) => {
			logged.push(error);
		})
		.build();

	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());

	await vi.waitFor(() => {
		const collectedErrorCheck = logged.every((e) => e instanceof MyError);
		expect(collectedErrorCheck).toBeTruthy();
	});
});

test("it runs hooks on interruption", async () => {
	const logged: unknown[] = [];

	const getValue = queryTask(() =>
		E.gen(function* () {
			yield* E.forever(E.gen(function* () {}));
		}),
	)
		.whenInterrupted((error) => {
			logged.push(error);
		})
		.whenInterrupted((error) => {
			logged.push(error);
		})
		.whenInterrupted((error) => {
			logged.push(error);
		})
		.build();

	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());
	await E.runPromise(getValue.spawn());
	getValue.interrupt();

	await vi.waitFor(() => {
		const collectedErrorCheck = logged.every(
			(e) => e instanceof Cause.InterruptedException,
		);
		expect(collectedErrorCheck).toBeTruthy();
	});
});
