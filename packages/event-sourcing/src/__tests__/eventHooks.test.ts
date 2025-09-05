import { expect, it } from "@effect/vitest";
import { Effect as E } from "effect";
import { EventBus } from "../EventBus.js";
import { Listener } from "../listeners";
import { DummyEvent } from "../testUtils/DummyEvent.js";

it.scoped("runs hooks on event cancellation", () =>
	E.gen(function* () {
		const hookOrder: number[] = [];
		const event = new DummyEvent()
			.onCancel(() =>
				E.sync(() => {
					hookOrder.push(1);
				}),
			)
			.onCancel(() =>
				E.sync(() => {
					hookOrder.push(2);
				}),
			);

		class Listener1 extends Listener("Listener1")(
			() =>
				({ parent, context }) =>
					E.succeed({
						...parent,
						send(e) {
							return E.gen(this, function* () {
								yield* e.cancel();
								return yield* context.next(e);
							});
						},
					}),
		) {}

		class Listener2 extends Listener("Listener2")(
			() =>
				({ parent, context }) =>
					E.succeed({
						...parent,
						send(e) {
							return E.gen(this, function* () {
								/**
								 * Cancel the event twice, to make sure
								 * that hooks do not
								 * */
								yield* e.cancel();
								return yield* context.next(e);
							});
						},
					}),
		) {}

		const eventBus = yield* EventBus.makeAsValue(
			EventBus.Default([new Listener1(), new Listener2()]),
		);

		const result = yield* eventBus.send(event);

		expect(result).toEqual(event);
		expect(hookOrder).toEqual([1, 2]);
	}),
);

it.scoped("runs hooks on event completion", () =>
	E.gen(function* () {
		const hookOrder: number[] = [];
		const event = new DummyEvent()
			.onComplete(() =>
				E.sync(() => {
					hookOrder.push(1);
				}),
			)
			.onComplete(() =>
				E.sync(() => {
					hookOrder.push(2);
				}),
			);

		class Listener1 extends Listener("Listener1")(
			() =>
				({ parent, context }) =>
					E.succeed({
						...parent,
						send(e) {
							return E.gen(this, function* () {
								yield* e.complete();
								return yield* context.next(e);
							});
						},
					}),
		) {}

		class Listener2 extends Listener("Listener2")(
			() =>
				({ parent, context }) =>
					E.succeed({
						...parent,
						send(e) {
							return E.gen(this, function* () {
								yield* e.complete();
								return yield* context.next(e);
							});
						},
					}),
		) {}

		const eventBus = yield* EventBus.makeAsValue(
			EventBus.Default([new Listener1(), new Listener2()]),
		);

		const result = yield* eventBus.send(event);

		expect(result).toEqual(event);
		expect(hookOrder).toEqual([1, 2]);
	}),
);

it.scoped(
	"does not complete events automatically when they reach chain end",
	() =>
		E.gen(function* () {
			const logged: number[] = [];
			const event = new DummyEvent().onComplete(() =>
				E.sync(() => {
					logged.push(1);
				}),
			);

			class Listener1 extends Listener("Listener1")(
				() =>
					({ parent }) =>
						E.succeed({
							...parent,
						}),
			) {}

			const eventBus = yield* EventBus.makeAsValue(
				EventBus.Default([new Listener1()]),
			);

			const result = yield* eventBus.send(event);

			expect(result).toEqual(event);
			expect(result.isUndetermined()).toBeTruthy();
			expect(logged).toEqual([]);
		}),
);
