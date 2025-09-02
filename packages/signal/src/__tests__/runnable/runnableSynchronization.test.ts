import { expect, it } from "@effect/vitest";
import { Data, Effect as E, Exit, Fiber, Queue } from "effect";
import { Runnable } from "../../application/plugins/runnable/Runnable";
import { getStreamEffect } from "./utils.js";

it.scoped("synchronizes multiple waiting callers during success", () =>
	E.gen(function* () {
		const queue = yield* Queue.unbounded<number>();
		const getValue = new Runnable(getStreamEffect(queue));

		yield* getValue.spawn();

		const fibers = E.runFork(
			E.all(
				[
					getValue.result(),
					getValue.result(),
					getValue.result(),
					getValue.result(),
				],
				{ concurrency: "unbounded" },
			),
		);

		yield* queue.offer(1);
		const results = yield* Fiber.join(fibers);

		expect(results).toEqual([1, 1, 1, 1]);

		const afterCompletionResult = yield* getValue.result();
		expect(afterCompletionResult).toEqual(1);
		expect(getValue.isSucceeded()).toBeTruthy();
		expect(getValue.isCompleted()).toBeTruthy();
	}),
);

it.scoped("synchronizes multiple waiting callers during error", () =>
	E.gen(function* () {
		class MyError extends Data.TaggedError("MyError") {}

		const getValue = new Runnable(
			E.gen(function* () {
				return yield* new MyError();
			}),
		);

		yield* getValue.spawn();

		const fibers = E.runFork(
			E.all(
				[
					getValue.resultSafe(),
					getValue.resultSafe(),
					getValue.resultSafe(),
					getValue.resultSafe(),
				],
				{ concurrency: "unbounded" },
			),
		);

		const [res1, res2, res3, res4] = yield* Fiber.join(fibers);

		expect(Exit.isFailure(res1)).toBeTruthy();
		expect(Exit.isFailure(res2)).toBeTruthy();
		expect(Exit.isFailure(res3)).toBeTruthy();
		expect(Exit.isFailure(res4)).toBeTruthy();

		const afterCompletionResult = yield* getValue.resultSafe();
		expect(Exit.isFailure(afterCompletionResult)).toBeTruthy();
		expect(getValue.isFailed()).toBeTruthy();
		expect(getValue.isCompleted()).toBeTruthy();
	}),
);

it.scoped("synchronizes multiple waiting callers during interruption", () =>
	E.gen(function* () {
		const queue = yield* Queue.unbounded<number>();

		const getValue = new Runnable(getStreamEffect(queue));

		yield* getValue.spawn();

		const fibers = E.runFork(
			E.all(
				[
					getValue.resultSafe(),
					getValue.resultSafe(),
					getValue.resultSafe(),
					getValue.resultSafe(),
				],
				{ concurrency: "unbounded" },
			),
		);

		yield* getValue.interrupt();

		const [res1, res2, res3, res4] = yield* Fiber.join(fibers);

		expect(Exit.isInterrupted(res1)).toBeTruthy();
		expect(Exit.isInterrupted(res2)).toBeTruthy();
		expect(Exit.isInterrupted(res3)).toBeTruthy();
		expect(Exit.isInterrupted(res4)).toBeTruthy();

		const afterCompletionResult = yield* getValue.resultSafe();
		expect(Exit.isInterrupted(afterCompletionResult)).toBeTruthy();
		expect(getValue.isInterrupted()).toBeTruthy();
		expect(getValue.isCompleted()).toBeTruthy();
	}),
);

it.scoped("waits for task start", () =>
	E.gen(function* () {
		let ran = false;

		const getValue = new Runnable(
			E.gen(function* () {
				return 1;
			}),
		);

		const fiber = E.runFork(
			E.all([
				getValue.waitForTrigger(),
				E.gen(function* () {
					ran = true;
				}),
			]),
		);

		yield* getValue.spawn();
		yield* Fiber.join(fiber);

		expect(ran).toBeTruthy();
	}),
);

it.scoped("waits for task start when an error is thrown", () =>
	E.gen(function* () {
		let ran = false;

		class MyError extends Data.TaggedError("MyError") {}

		const getValue = new Runnable(
			E.gen(function* () {
				yield* new MyError();
			}),
		);

		const fiber = E.runFork(
			E.all([
				getValue.waitForTrigger(),
				E.gen(function* () {
					ran = true;
				}),
			]),
		);

		yield* getValue.spawn();
		yield* Fiber.join(fiber);

		expect(ran).toBeTruthy();
	}),
);
