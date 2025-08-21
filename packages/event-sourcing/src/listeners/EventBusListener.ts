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

export class EventBusListener extends Context.Tag("EventBusListener")<
	EventBusListener,
	IEventBusListener
>() {
	static make<A extends IEventBusListener, R>(
		factory: (options: {
			parent: IEventBusListener;
		}) => E.Effect<A, never, R>,
	) {
		return Layer.effect(
			this,
			E.gen(function* () {
				const id = uuid();
				const context = yield* EventBusListenerContext;

				return yield* factory({
					parent: {
						getId() {
							return id;
						},

						getContext() {
							return context;
						},

						send(event: BusEvent) {
							return E.succeed(event);
						},
					},
				});
			}),
		).pipe(Layer.provide(EventBusListenerContext.Default));
	}
}
