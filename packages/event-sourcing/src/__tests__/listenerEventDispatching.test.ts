import { expect, it } from "@effect/vitest";
import { gen, succeed } from "effect/Effect";
import { EventBus } from "../EventBus.js";
import { BusEvent } from "../events/BusEvent.js";
import { BusEventListenerContext } from "../listeners/BusEventListener.js";
import { DummyEvent } from "./utils/DummyEvent.js";
import { DummyEventListener } from "./utils/DummyEventListener.js";

it.effect("allows listeners to dispatch events back to event buses", () =>
	gen(function* () {
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

			override apply(
				event: BusEvent,
				{ next, sendToEventBus }: BusEventListenerContext,
			) {
				return gen(this, function* () {
					executionOrder.push(2);
					const eventId = this.savedEvent.getId();

					if (!this.alreadyDispatched.includes(eventId)) {
						this.alreadyDispatched.push(eventId);
						return yield* sendToEventBus(this.savedEvent);
					}

					return yield* next(event);
				});
			}
		};

		yield* eventBus.with(() => succeed([new Listener1(), new Listener2()]));
		const event = new DummyEvent();
		const result = yield* eventBus.send(event);

		expect(result.getId()).not.toEqual(event.getId());
		expect(executionOrder).toEqual([1, 2, 1]);
	}),
);

it.effect("can opt in to seeing events dispatched by itself", () =>
	gen(function* () {
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
				{ next, sendToEventBus }: BusEventListenerContext,
			) {
				return gen(this, function* () {
					executionOrder.push(2);
					const eventId = this.savedEvent.getId();

					if (!this.alreadyDispatched.includes(eventId)) {
						this.alreadyDispatched.push(eventId);
						return yield* sendToEventBus(this.savedEvent);
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
