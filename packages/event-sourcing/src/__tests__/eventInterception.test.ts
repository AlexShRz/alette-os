import { expect, it } from "@effect/vitest";
import { Effect as E, Layer } from "effect";
import { EventBus } from "../EventBus.js";
import { Listener } from "../listeners/Listener";
import { EventInterceptor } from "../pipeline/EventInterceptor.js";
import { DummyEvent } from "../testUtils/DummyEvent.js";

it.scoped("can intercept events", () =>
	E.gen(function* () {
		const id1 = "asdhjasbdjkabsd";
		const id2 = "asdhjasbdjkabsd";
		const executionOrder: number[] = [];
		const intercepted: string[] = [];

		const event1 = new DummyEvent(id1);
		const event2 = new DummyEvent(id2);

		const Interceptor = EventInterceptor.make((e) =>
			E.gen(function* () {
				intercepted.push(e.getId());
				return e;
			}),
		);

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
						let sent = false;

						return {
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(2);

									if (!sent) {
										sent = true;
										yield* this.getContext().sendToBus(event2);
									}

									return yield* context.next(e);
								});
							},
						};
					}),
		) {}

		const EventBusLayer = EventBus.Default([
			new Listener1(),
			new Listener2(),
		]).pipe(Layer.provide(Interceptor));

		const eventBus = yield* E.gen(function* () {
			return yield* EventBus;
		}).pipe(E.provide(EventBusLayer));

		const result = yield* eventBus.send(event1);

		expect(result).toEqual(event1);
		expect(executionOrder).toEqual([1, 2, 1]);
		expect(intercepted).toEqual([id1, id2, id1]);
	}),
);

it.scoped("can intercept events across nested event buses", () =>
	E.gen(function* () {
		const id1 = "asdhjasbdjkabsd";
		const id2 = "asdhjasbdjkabsd";
		const executionOrder: number[] = [];
		const intercepted: string[] = [];
		let interceptors = 0;

		const event1 = new DummyEvent(id1);
		const event2 = new DummyEvent(id2);

		const Interceptor = EventInterceptor.make((e) =>
			E.gen(function* () {
				intercepted.push(e.getId());
				return e;
			}),
		).pipe(
			Layer.tap((c) => {
				++interceptors;
				return E.succeed(c);
			}),
		);

		class Listener1 extends Listener.as("Listener1")(
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

		class Listener2 extends Listener.as("Listener2")(
			() =>
				({ parent, context }) =>
					E.gen(function* () {
						const anotherEventBus = yield* EventBus.makeAsValue(EventBusLayer1);

						return {
							...parent,
							send(e) {
								return E.gen(this, function* () {
									executionOrder.push(1);
									yield* anotherEventBus.send(event2);
									return yield* context.next(e);
								});
							},
						};
					}),
		) {}

		const EventBusLayer1 = EventBus.Default([new Listener1()]);

		const EventBusLayer2 = EventBus.Default([new Listener2()]);

		const eventBus = yield* EventBus.makeAsValue(
			EventBusLayer2.pipe(Layer.provide(Interceptor)),
		);

		const result = yield* eventBus.send(event1);

		expect(result).toEqual(event1);
		expect(executionOrder).toEqual([1, 2]);
		expect(intercepted).toEqual([id1, id2]);
		expect(interceptors).toEqual(1);
	}),
);
