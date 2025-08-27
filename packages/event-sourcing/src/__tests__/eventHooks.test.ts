import { expect, it } from "@effect/vitest";
import { Effect as E } from "effect";
import { EventBus } from "../EventBus.js";
import { EventBusListenerFactory } from "../listeners/EventBusListenerFactory.js";
import { EventBusListener } from "../listeners/index.js";
import { DummyEvent } from "../testUtils/DummyEvent.js";

it.scoped("runs hooks on event cancellation", () =>
	E.gen(function* () {
		const hookOrder: number[] = [];
		const event = new DummyEvent()
			.onCancel(() =>
				E.sync(() => {
					hookOrder.push(1);
				}),
			)
			.onCancel(() =>
				E.sync(() => {
					hookOrder.push(2);
				}),
			);

		const eventBus = yield* EventBus.makeAsValue(
			EventBus.Default([
				new EventBusListenerFactory(() =>
					EventBusListener.make(({ parent }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
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
									/**
									 * Cancel the event twice, to make sure
									 * that hooks do not
									 * */
									yield* e.cancel();
									return yield* this.getContext().next(e);
								});
							},
						}),
					),
				),
			]),
		);

		const result = yield* eventBus.send(event);

		expect(result).toEqual(event);
		expect(hookOrder).toEqual([1, 2]);
	}),
);

it.scoped("runs hooks on event completion", () =>
	E.gen(function* () {
		const hookOrder: number[] = [];
		const event = new DummyEvent()
			.onComplete(() =>
				E.sync(() => {
					hookOrder.push(1);
				}),
			)
			.onComplete(() =>
				E.sync(() => {
					hookOrder.push(2);
				}),
			);

		const eventBus = yield* EventBus.makeAsValue(
			EventBus.Default([
				new EventBusListenerFactory(() =>
					EventBusListener.make(({ parent }) =>
						E.succeed({
							...parent,
							send(e) {
								return E.gen(this, function* () {
									yield* e.complete();
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
									/**
									 * Cancel the event twice, to make sure
									 * that hooks do not
									 * */
									yield* e.complete();
									return yield* this.getContext().next(e);
								});
							},
						}),
					),
				),
			]),
		);

		const result = yield* eventBus.send(event);

		expect(result).toEqual(event);
		expect(hookOrder).toEqual([1, 2]);
	}),
);
