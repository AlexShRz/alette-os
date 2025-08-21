import { expect, it } from "@effect/vitest";
import { Effect as E } from "effect";
import { EventBus } from "../EventBus.js";
import { EventBusListener } from "../listeners/EventBusListener.js";
import { EventBusListenerFactory } from "../listeners/EventBusListenerFactory.js";
import { DummyEvent } from "./utils/DummyEvent.js";

it.scoped(
	"passes events through every listener in order using their priority",
	() =>
		E.gen(function* () {
			const executionOrder: number[] = [];

			const eventBus = yield* EventBus.makeAsValue(
				EventBus.Default([
					new EventBusListenerFactory(
						() =>
							EventBusListener.make(({ parent }) =>
								E.succeed({
									...parent,
									send(e) {
										return E.gen(this, function* () {
											executionOrder.push(2);

											return yield* this.getContext().next(e);
										});
									},
								}),
							),
						{
							priority: 2,
						},
					),
					new EventBusListenerFactory(
						() =>
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
						{
							priority: 1,
						},
					),
				]),
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

			const eventBus = yield* EventBus.makeAsValue(
				EventBus.Default([
					new EventBusListenerFactory(() =>
						EventBusListener.make(({ parent }) =>
							E.succeed({
								...parent,
								send(e) {
									return E.gen(this, function* () {
										executionOrder.push(1);
										yield* e.cancel();

										return yield* this.getContext().next(e);
									});
								},
							}),
						),
					),
					new EventBusListenerFactory(
						() =>
							EventBusListener.make(({ parent }) =>
								E.succeed({
									...parent,
									send(e) {
										return E.gen(this, function* () {
											executionOrder.push(2);

											return yield* this.getContext().next(e);
										});
									},
								}),
							),
						{
							canReceiveCancelled: true,
						},
					),
					new EventBusListenerFactory(() =>
						EventBusListener.make(({ parent }) =>
							E.succeed({
								...parent,
								send(e) {
									return E.gen(this, function* () {
										executionOrder.push(3);

										return yield* this.getContext().next(e);
									});
								},
							}),
						),
					),
				]),
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

			const eventBus = yield* EventBus.makeAsValue(
				EventBus.Default([
					new EventBusListenerFactory(() =>
						EventBusListener.make(({ parent }) =>
							E.succeed({
								...parent,
								send(e) {
									return E.gen(this, function* () {
										executionOrder.push(1);
										yield* e.complete();

										return yield* this.getContext().next(e);
									});
								},
							}),
						),
					),
					new EventBusListenerFactory(
						() =>
							EventBusListener.make(({ parent }) =>
								E.succeed({
									...parent,
									send(e) {
										return E.gen(this, function* () {
											executionOrder.push(2);

											return yield* this.getContext().next(e);
										});
									},
								}),
							),
						{
							canReceiveCompleted: true,
						},
					),
					new EventBusListenerFactory(() =>
						EventBusListener.make(({ parent }) =>
							E.succeed({
								...parent,
								send(e) {
									return E.gen(this, function* () {
										executionOrder.push(3);

										return yield* this.getContext().next(e);
									});
								},
							}),
						),
					),
				]),
			);

			const event = new DummyEvent();
			const result = yield* eventBus.send(event);

			expect(result).toEqual(event);
			expect(executionOrder).toEqual([1, 2]);
		}),
);

it.scoped("allows to extend the chain with custom 'broadcast' function", () =>
	E.gen(function* () {
		const eventBus = yield* EventBus.makeAsValue(
			EventBus.Default([
				new EventBusListenerFactory(() =>
					EventBusListener.make(({ parent }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									/**
									 * Cancel the event to make sure it's
									 * still piped through the broadcaster fn
									 * */
									yield* e.cancel();

									return yield* this.getContext().next(e);
								});
							},
						}),
					),
				),
				new EventBusListenerFactory(() =>
					EventBusListener.make(({ parent }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									return yield* this.getContext().next(e);
								});
							},
						}),
					),
				),
			]),
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
