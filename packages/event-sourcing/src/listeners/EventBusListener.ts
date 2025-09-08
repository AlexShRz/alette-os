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

export interface IEventBusListenerFactory<A extends IEventBusListener, I, R> {
	(options: {
		id: string;
		context: EventBusListenerContext;
		parent: IEventBusListener;
	}): E.Effect<A, I, R>;
}

export class EventBusListener extends Context.Tag("EventBusListener")<
	EventBusListener,
	IEventBusListener
>() {
	static make<A extends IEventBusListener, I, R>(
		factory: IEventBusListenerFactory<A, I, R>,
	) {
		return Layer.scoped(
			this,
			E.gen(function* () {
				const { base, id, context } = yield* E.gen(function* () {
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
								return context.next(event);
							},
						} satisfies IEventBusListener,
					};
				});

				return yield* factory({
					id,
					context,
					parent: {
						...base,
					},
				});
			}).pipe(E.orDie),
		).pipe(Layer.provide(EventBusListenerContext.Default));
	}
}
