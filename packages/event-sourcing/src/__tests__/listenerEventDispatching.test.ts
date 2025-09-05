import { expect, it } from "@effect/vitest";
import { Effect as E } from "effect";
import { EventBus } from "../EventBus.js";
import { Listener } from "../listeners/Listener";
import { DummyEvent } from "../testUtils/DummyEvent.js";

it.scoped("allows listeners to dispatch events back to event buses", () =>
	E.gen(function* () {
		const executionOrder: number[] = [];

		class Listener1 extends Listener.as("Listener1")(
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

		class Listener2 extends Listener.as("Listener2")(
			() =>
				({ parent, context }) =>
					E.gen(function* () {
						const alreadyDispatched: string[] = [];
						const savedEvent = new DummyEvent("myDummyEvent");

						return {
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(2);
									const eventId = savedEvent.getId();

									if (!alreadyDispatched.includes(eventId)) {
										alreadyDispatched.push(eventId);
										return yield* context.sendToBus(savedEvent);
									}

									return yield* context.next(e);
								});
							},
						};
					}),
		) {}

		const eventBus = yield* EventBus.makeAsValue(
			EventBus.Default([new Listener1(), new Listener2()]),
		);

		const event = new DummyEvent();
		const result = yield* eventBus.send(event);

		expect(result.getId()).not.toEqual(event.getId());
		expect(executionOrder).toEqual([1, 2, 1]);
	}),
);

it.scoped("can opt in to seeing events dispatched by itself", () =>
	E.gen(function* () {
		const executionOrder: number[] = [];

		class Listener1 extends Listener.as("Listener1")(
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

		class Listener2 extends Listener.as("Listener2", {
			canReceiveEventsSentBySelf: true,
		})(
			() =>
				({ parent, context }) =>
					E.gen(function* () {
						const alreadyDispatched: string[] = [];
						const savedEvent = new DummyEvent("myDummyEvent");

						return {
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(2);
									const eventId = savedEvent.getId();

									if (!alreadyDispatched.includes(eventId)) {
										alreadyDispatched.push(eventId);
										return yield* context.sendToBus(savedEvent);
									}

									return yield* context.next(e);
								});
							},
						};
					}),
		) {}

		const eventBus = yield* EventBus.makeAsValue(
			EventBus.Default([new Listener1(), new Listener2()]),
		);

		const event = new DummyEvent();
		const result = yield* eventBus.send(event);

		expect(result.getId()).not.toEqual(event.getId());
		expect(executionOrder).toEqual([1, 2, 1, 2]);
	}),
);
