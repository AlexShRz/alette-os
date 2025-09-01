import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { v4 as uuid } from "uuid";
import { BusEvent } from "../events/BusEvent.js";
import { EventBusListenerContext } from "./EventBusListenerContext.js";

export interface IEventBusListener {
	getId(): string;

	getContext(): EventBusListenerContext;

	send(event: BusEvent): E.Effect<BusEvent, never, never>;
}

export const EventBusListenerTag = "EventBusListener" as const;

export class EventBusListener extends Context.Tag(EventBusListenerTag)<
	EventBusListener,
	IEventBusListener
>() {
	static parent() {
		return E.gen(function* () {
			const id = uuid();
			const context = yield* E.serviceOptional(EventBusListenerContext);

			return {
				id,
				context,
				base: {
					getId() {
						return id;
					},

					getContext() {
						return context;
					},

					send(event: BusEvent) {
						return E.succeed(event);
					},
				} satisfies IEventBusListener,
			};
		}).pipe(E.orDie);
	}

	static make<A extends IEventBusListener, R>(
		factory: (options: {
			parent: IEventBusListener;
		}) => E.Effect<A, never, R>,
	) {
		return Layer.effect(
			EventBusListener,
			E.gen(function* () {
				const { base } = yield* EventBusListener.parent();

				return yield* factory({
					parent: {
						...base,
					},
				});
			}),
		).pipe(Layer.provide(EventBusListenerContext.Default));
	}
}
