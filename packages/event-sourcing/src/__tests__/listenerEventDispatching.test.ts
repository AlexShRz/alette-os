import { expect, it } from "@effect/vitest";
import { Effect as E } from "effect";
import { EventBus } from "../EventBus.js";
import { EventBusListener } from "../listeners/EventBusListener.js";
import { EventBusListenerFactory } from "../listeners/EventBusListenerFactory.js";
import { DummyEvent } from "./utils/DummyEvent.js";

it.scoped("allows listeners to dispatch events back to event buses", () =>
	E.gen(function* () {
		const executionOrder: number[] = [];

		const eventBus = yield* EventBus.makeAsValue(
			EventBus.Default([
				new EventBusListenerFactory(() =>
					EventBusListener.make(({ parent }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(1);
									return yield* this.getContext().next(e);
								});
							},
						}),
					),
				),
				new EventBusListenerFactory(() =>
					EventBusListener.make(({ parent }) => {
						const alreadyDispatched: string[] = [];
						const savedEvent = new DummyEvent("myDummyEvent");

						return E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(2);
									const eventId = savedEvent.getId();

									if (!alreadyDispatched.includes(eventId)) {
										alreadyDispatched.push(eventId);
										return yield* this.getContext().sendToBus(savedEvent);
									}

									return yield* this.getContext().next(e);
								});
							},
						});
					}),
				),
			]),
		);

		const event = new DummyEvent();
		const result = yield* eventBus.send(event);

		expect(result.getId()).not.toEqual(event.getId());
		expect(executionOrder).toEqual([1, 2, 1]);
	}),
);

it.scoped("can opt in to seeing events dispatched by itself", () =>
	E.gen(function* () {
		const eventBus = new EventBus();
		const executionOrder: number[] = [];

		const Listener1 = class extends DummyEventListener {
			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				executionOrder.push(1);
				return next(event);
			}
		};
		const Listener2 = class extends DummyEventListener {
			protected alreadyDispatched: string[] = [];
			protected savedEvent = new DummyEvent("myDummyEvent");

			override canReceiveEventsSentBySelf() {
				return true;
			}

			override apply(
				event: BusEvent,
				{ next, sendToBus }: BusEventListenerContext,
			) {
				return E.gen(this, function* () {
					executionOrder.push(2);
					const eventId = this.savedEvent.getId();

					if (!this.alreadyDispatched.includes(eventId)) {
						this.alreadyDispatched.push(eventId);
						return yield* sendToBus(this.savedEvent);
					}

					return yield* next(event);
				});
			}
		};

		yield* eventBus.with(() => succeed([new Listener1(), new Listener2()]));
		const event = new DummyEvent();
		const result = yield* eventBus.send(event);

		expect(result.getId()).not.toEqual(event.getId());
		expect(executionOrder).toEqual([1, 2, 1, 2]);
	}),
);
