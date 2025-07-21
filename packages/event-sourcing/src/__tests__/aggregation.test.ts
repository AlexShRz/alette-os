import { expect, it } from "@effect/vitest";
import { gen, succeed } from "effect/Effect";
import { EventAggregator } from "../aggregator/EventAggregator.js";
import { BusEvent } from "../events/BusEvent.js";
import { PersistentEvent } from "../events/PersistentEvent.js";
import { BusEventListenerContext } from "../listeners/BusEventListener.js";
import { DummyEventListener } from "./utils/DummyEventListener.js";
import { DummyPersistentEvent } from "./utils/DummyPersistentEvent.js";

it.effect("aggregates events and replays them", () =>
	gen(function* () {
		const aggregator = EventAggregator.make();

		const event1 = DummyPersistentEvent.make();
		const event2 = DummyPersistentEvent.make();

		yield* aggregator.save(event1);
		yield* aggregator.save(event2);

		const replayedEvents: PersistentEvent[] = [];

		const Listener1 = class extends DummyEventListener {
			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				if (event instanceof PersistentEvent) {
					replayedEvents.push(event);
				}

				return next(event);
			}
		};

		const listener = new Listener1().bindContext({
			sendToEventBus: (e) => succeed(e),
			next: (e) => succeed(e),
		});

		yield* aggregator.replayAll(listener);
		yield* aggregator.replayLast(listener);
		yield* aggregator.replaySelected(
			listener,
			(e) => e.getId() === event1.getId(),
		);

		expect(replayedEvents.map((e) => e.getId())).toEqual([
			event1.getId(),
			event2.getId(),
			event2.getId(),
			event1.getId(),
		]);
	}),
);
