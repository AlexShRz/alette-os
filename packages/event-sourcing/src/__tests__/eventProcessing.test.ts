import { expect, it } from "@effect/vitest";
import { gen, provide, succeed } from "effect/Effect";
import { EventBus } from "../EventBus.js";
import { BusEvent } from "../events/BusEvent.js";
import { BusEventListenerContext } from "../listeners/BusEventListener.js";
import { canEventBeCancelled } from "../utils/eventCancellationUtils.js";
import { DummyEvent } from "./utils/DummyEvent.js";
import { DummyEventListener } from "./utils/DummyEventListener.js";

it.scoped(
	"passes events through every listener in order using their priority",
	() =>
		gen(function* () {
			const eventBus = yield* EventBus;
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

			yield* eventBus.with(() => succeed([new Listener1(), new Listener2()]));
			const event = DummyEvent.make();
			const result = yield* eventBus.send(event);

			expect(result).toEqual(event);
			expect(executionOrder).toEqual([1, 2]);
		}).pipe(provide(EventBus.Live)),
);

it.scoped(
	"skips listeners that cannot process cancelled events if the event is cancelled",
	() =>
		gen(function* () {
			const eventBus = yield* EventBus;
			const executionOrder: number[] = [];

			const Listener1 = class extends DummyEventListener {
				override apply(event: BusEvent, { next }: BusEventListenerContext) {
					executionOrder.push(1);
					return next(canEventBeCancelled(event) ? event.cancel() : event);
				}
			};
			const Listener2 = class extends DummyEventListener {
				override canReceiveCancelled(): boolean {
					return true;
				}

				override apply(event: BusEvent, { next }: BusEventListenerContext) {
					executionOrder.push(2);
					return next(event);
				}
			};
			const Listener3 = class extends DummyEventListener {
				override apply(event: BusEvent, { next }: BusEventListenerContext) {
					executionOrder.push(3);
					return next(event);
				}
			};

			yield* eventBus.with(() =>
				succeed([new Listener1(), new Listener2(), new Listener3()]),
			);
			const event = DummyEvent.make();
			const result = yield* eventBus.send(event);

			expect(result).toEqual(event);
			expect(executionOrder).toEqual([1, 2]);
		}).pipe(provide(EventBus.Live)),
);

it.scoped("receives event after all chained listeners", () =>
	gen(function* () {
		const eventBus = yield* EventBus;

		const Listener1 = class extends DummyEventListener {
			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				return next(event);
			}
		};
		const Listener2 = class extends DummyEventListener {
			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				return next(event);
			}
		};

		yield* eventBus.with(() => succeed([new Listener1(), new Listener2()]));
		const event = DummyEvent.make();
		let tappedEventId: string | null = null;
		const result = yield* eventBus
			.takeAfter((e) =>
				gen(function* () {
					tappedEventId = e.getId();
				}),
			)
			.send(event);

		expect(tappedEventId).toEqual(event.getId());
		expect(result).toEqual(event);
	}).pipe(provide(EventBus.Live)),
);
