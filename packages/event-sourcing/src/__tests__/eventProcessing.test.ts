import { expect, it } from "@effect/vitest";
import { Effect as E } from "effect";
import { EventBus } from "../EventBus.js";
import { Listener } from "../listeners";
import { DummyEvent } from "../testUtils/DummyEvent.js";

it.scoped(
	"passes events through every listener in order using their priority",
	() =>
		E.gen(function* () {
			const executionOrder: number[] = [];

			class Listener1 extends Listener("Listener1", {
				priority: 2,
			})(
				() =>
					({ parent, context }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(2);

									return yield* context.next(e);
								});
							},
						}),
			) {}

			class Listener2 extends Listener("Listener2", {
				priority: 1,
			})(
				() =>
					({ parent, context }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(1);

									return yield* context.next(e);
								});
							},
						}),
			) {}

			const eventBus = yield* EventBus.makeAsValue(
				EventBus.Default([new Listener1(), new Listener2()]),
			);

			const event = new DummyEvent();
			const result = yield* eventBus.send(event);

			expect(result).toEqual(event);
			expect(executionOrder).toEqual([1, 2]);
		}),
);

it.scoped(
	"skips listeners that cannot process cancelled events if the event was cancelled",
	() =>
		E.gen(function* () {
			const executionOrder: number[] = [];

			class Listener1 extends Listener("Listener1")(
				() =>
					({ parent, context }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(1);
									yield* e.cancel();
									return yield* context.next(e);
								});
							},
						}),
			) {}

			class Listener2 extends Listener("Listener2", {
				canReceiveCancelled: true,
			})(
				() =>
					({ parent, context }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(2);
									return yield* context.next(e);
								});
							},
						}),
			) {}

			class Listener3 extends Listener("Listener3")(
				() =>
					({ parent, context }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(3);
									return yield* context.next(e);
								});
							},
						}),
			) {}

			const eventBus = yield* EventBus.makeAsValue(
				EventBus.Default([new Listener1(), new Listener2(), new Listener3()]),
			);

			const event = new DummyEvent();
			const result = yield* eventBus.send(event);

			expect(result).toEqual(event);
			expect(executionOrder).toEqual([1, 2]);
		}),
);

it.scoped(
	"skips listeners that cannot process completed events if the event was completed",
	() =>
		E.gen(function* () {
			const executionOrder: number[] = [];

			class Listener1 extends Listener("Listener1")(
				() =>
					({ parent, context }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(1);
									yield* e.complete();
									return yield* context.next(e);
								});
							},
						}),
			) {}

			class Listener2 extends Listener("Listener2", {
				canReceiveCompleted: true,
			})(
				() =>
					({ parent, context }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(2);
									return yield* context.next(e);
								});
							},
						}),
			) {}

			class Listener3 extends Listener("Listener3")(
				() =>
					({ parent, context }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(3);
									return yield* context.next(e);
								});
							},
						}),
			) {}

			const eventBus = yield* EventBus.makeAsValue(
				EventBus.Default([new Listener1(), new Listener2(), new Listener3()]),
			);

			const event = new DummyEvent();
			const result = yield* eventBus.send(event);

			expect(result).toEqual(event);
			expect(executionOrder).toEqual([1, 2]);
		}),
);

it.scoped("allows to extend the chain with custom 'broadcast' function", () =>
	E.gen(function* () {
		class Listener1 extends Listener("Listener1")(
			() =>
				({ parent, context }) =>
					E.succeed({
						...parent,
						send(e) {
							return E.gen(this, function* () {
								/**
								 * Cancel the event to make sure it's
								 * still piped through the broadcaster fn
								 * */
								yield* e.cancel();
								return yield* context.next(e);
							});
						},
					}),
		) {}

		class Listener2 extends Listener("Listener2")(
			() =>
				({ parent }) =>
					E.succeed({
						...parent,
					}),
		) {}

		const eventBus = yield* EventBus.makeAsValue(
			EventBus.Default([new Listener1(), new Listener2()]),
		);

		const event = new DummyEvent();
		let tappedEventId: string | null = null;

		eventBus.broadcast((e) =>
			E.gen(function* () {
				tappedEventId = e.getId();
			}),
		);

		const result = yield* eventBus.send(event);
		expect(tappedEventId).toEqual(event.getId());
		expect(result).toEqual(event);
	}),
);
