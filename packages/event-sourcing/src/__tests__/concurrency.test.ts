import { expect, it } from "@effect/vitest";
import { TestClock } from "effect";
import { fork, gen, sleep, succeed, zipRight } from "effect/Effect";
import * as Fiber from "effect/Fiber";
import { EventBus } from "../EventBus.js";
import { BusEvent } from "../events/BusEvent.js";
import { BusEventListenerContext } from "../listeners/BusEventListener.js";
import { DummyEvent } from "./utils/DummyEvent.js";
import { DummyEventListener } from "./utils/DummyEventListener.js";

it.effect("suspends event processing if listener mutation is in progress", () =>
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
			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				executionOrder.push(2);
				return next(event);
			}
		};

		const fiber1 = yield* eventBus
			.with(() =>
				zipRight(
					sleep("4 seconds"), // simulate delay
					succeed([new Listener1(), new Listener2()]),
				),
			)
			.pipe(fork);

		const event = new DummyEvent();
		const fiber2 = yield* eventBus.send(event).pipe(fork);

		// Events should be suspended
		expect(executionOrder).toEqual([]);
		yield* TestClock.adjust("5 seconds");

		const result = yield* Fiber.zipRight(fiber1, fiber2);
		expect(result).toEqual(event);
		expect(executionOrder).toEqual([1, 2]);
	}),
);
