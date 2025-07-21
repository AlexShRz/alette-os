import { expect, it } from "@effect/vitest";
import { gen, provide } from "effect/Effect";
import { EventBus } from "../EventBus.js";
import { BusEvent } from "../events/BusEvent.js";
import { BusEventListenerContext } from "../listeners/BusEventListener.js";
import { DummyEvent } from "./utils/DummyEvent.js";
import { DummyEventListener } from "./utils/DummyEventListener.js";

it.scoped("orders listeners based on their priority", () =>
	gen(function* () {
		const eventBus = yield* EventBus;
		const executionOrder: number[] = [];

		const Listener1 = class extends DummyEventListener {
			override getPriority() {
				return 2;
			}

			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				executionOrder.push(1);
				return next(event);
			}
		};
		const Listener2 = class extends DummyEventListener {
			override getPriority() {
				return 1;
			}

			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				executionOrder.push(2);
				return next(event);
			}
		};

		yield* eventBus.with(() =>
			gen(function* () {
				const l1 = new Listener1();
				const l2 = new Listener2();

				return [l1, l2];
			}),
		);
		const event = DummyEvent.make();
		const result = yield* eventBus.send(event);

		expect(result).toEqual(event);
		expect(executionOrder).toEqual([2, 1]);
	}).pipe(provide(EventBus.Live)),
);

it.scoped("reorders listeners after listener list mutation", () =>
	gen(function* () {
		const eventBus = yield* EventBus;
		const executionOrder: number[] = [];

		const Listener1 = class extends DummyEventListener {
			override getPriority() {
				return 4;
			}

			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				executionOrder.push(2);
				return next(event);
			}
		};
		const Listener2 = class extends DummyEventListener {
			override getPriority() {
				return 5;
			}

			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				executionOrder.push(3);
				return next(event);
			}
		};
		const Listener3 = class extends DummyEventListener {
			override getPriority() {
				return 1;
			}

			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				executionOrder.push(1);
				return next(event);
			}
		};

		yield* eventBus.with(() =>
			gen(function* () {
				const l1 = new Listener1();
				const l2 = new Listener2();

				return [l1, l2];
			}),
		);
		yield* eventBus.with((prevListeners) =>
			gen(function* () {
				const l3 = new Listener3();

				// Place l3 last for auto listener sorting to trigger
				return [...prevListeners, l3];
			}),
		);
		const event = DummyEvent.make();
		const result = yield* eventBus.send(event);

		expect(result).toEqual(event);
		expect(executionOrder).toEqual([1, 2, 3]);
	}).pipe(provide(EventBus.Live)),
);
