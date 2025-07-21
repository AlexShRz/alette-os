import { expect, it } from "@effect/vitest";
import { gen, provide } from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Scope from "effect/Scope";
import { EventBus } from "../EventBus.js";
import { BusEvent } from "../events/BusEvent.js";
import { BusEventListenerContext } from "../listeners/BusEventListener.js";
import { DummyEvent } from "./utils/DummyEvent.js";
import { DummyEventListener } from "./utils/DummyEventListener.js";

it.scoped("runs listener hooks on attachment", () =>
	gen(function* () {
		const eventBus = yield* EventBus;
		const executionOrder: number[] = [];

		const Listener1 = class extends DummyEventListener {
			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				executionOrder.push(3);
				return next(event);
			}
		};
		const Listener2 = class extends DummyEventListener {
			override apply(event: BusEvent, { next }: BusEventListenerContext) {
				executionOrder.push(4);
				return next(event);
			}
		};

		yield* eventBus.with(() =>
			gen(function* () {
				const l1 = new Listener1();
				const l2 = new Listener2();

				l1.whenAttached(
					gen(function* () {
						executionOrder.push(1);
					}),
				);
				l2.whenAttached(
					gen(function* () {
						executionOrder.push(2);
					}),
				);

				return [l1, l2];
			}),
		);
		const event = DummyEvent.make();
		const result = yield* eventBus.send(event);

		expect(result).toEqual(event);
		expect(executionOrder).toEqual([1, 2, 3, 4]);
	}).pipe(provide(EventBus.Live)),
);

it.effect("runs listener shutdown hooks on scope close", () =>
	gen(function* () {
		const shutdownHookOrder: number[] = [];

		const test = gen(function* () {
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

			yield* eventBus.with(() =>
				gen(function* () {
					const l1 = new Listener1();
					const l2 = new Listener2();

					l1.whenShutdown(
						gen(function* () {
							shutdownHookOrder.push(1);
						}),
					);
					l2.whenShutdown(
						gen(function* () {
							shutdownHookOrder.push(2);
						}),
					);

					return [l1, l2];
				}),
			);
			const event = DummyEvent.make();
			const result = yield* eventBus.send(event);

			return { result, event };
		}).pipe(provide(EventBus.Live));

		const scope = yield* Scope.make();

		const { result, event } = yield* test.pipe(Scope.extend(scope));

		yield* Scope.close(scope, Exit.void);
		expect(result).toEqual(event);
		expect(shutdownHookOrder).toEqual([1, 2]);
	}),
);

it.scoped("runs listener shutdown hooks on manual listener removal", () =>
	gen(function* () {
		const shutdownHookOrder: number[] = [];

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

		yield* eventBus.with(() =>
			gen(function* () {
				const l1 = new Listener1();

				l1.whenShutdown(
					gen(function* () {
						shutdownHookOrder.push(1);
					}),
				);

				return [l1];
			}),
		);

		yield* eventBus.with(() =>
			gen(function* () {
				const l2 = new Listener2();

				l2.whenShutdown(
					gen(function* () {
						shutdownHookOrder.push(2);
					}),
				);

				return [l2];
			}),
		);
		const event = DummyEvent.make();
		const result = yield* eventBus.send(event);

		expect(result).toEqual(event);
		/**
		 * First listener should run its shutdown hooks
		 * */
		expect(shutdownHookOrder).toEqual([1]);
	}).pipe(provide(EventBus.Live)),
);
