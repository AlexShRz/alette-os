import { expect, it } from "@effect/vitest";
import { Effect as E, TestClock, TestContext } from "effect";
import { EventBus } from "../EventBus";
import { Listener } from "../listeners";
import { DummyEvent } from "../testUtils/DummyEvent";

it.scoped("waits for pipeline to be constructed before processing events", () =>
	E.gen(function* () {
		let enteredBodyTimes = 0;
		let processedTimes = 0;

		class Listener1 extends Listener("Listener1")(
			() =>
				({ parent, context }) =>
					E.gen(function* () {
						enteredBodyTimes++;

						return {
							...parent,
							send(e) {
								return E.gen(this, function* () {
									processedTimes++;
									return yield* context.next(e);
								});
							},
						};
					}),
		) {}

		class Listener2 extends Listener("Listener2")(
			() =>
				({ parent, context }) =>
					E.gen(function* () {
						yield* E.sleep("10 minutes");
						enteredBodyTimes++;

						return {
							...parent,
							send(e) {
								return E.gen(this, function* () {
									processedTimes++;
									return yield* context.next(e);
								});
							},
						};
					}),
		) {}

		const eventBus = yield* E.serviceOptional(EventBus).pipe(
			E.provide(EventBus.Default([new Listener1(), new Listener2()])),
			E.provide(TestContext.TestContext),
		);

		yield* eventBus.send(new DummyEvent()).pipe(E.fork);
		yield* eventBus.send(new DummyEvent()).pipe(E.fork);
		yield* eventBus.send(new DummyEvent()).pipe(E.fork);
		yield* eventBus.send(new DummyEvent()).pipe(E.fork);

		/**
		 * Make sure to yield here
		 * */
		yield* E.yieldNow();
		/**
		 * 1. Here one listener has already been set up,
		 * but the setup of another one is still in progress.
		 * 2. Hence, the count should be 1
		 * */
		expect(enteredBodyTimes).toEqual(1);

		yield* TestClock.adjust("11 minutes");

		expect(enteredBodyTimes).toEqual(2);
		expect(processedTimes).toEqual(8);
	}),
);
