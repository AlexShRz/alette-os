import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { EventBusListener, IEventBusListener } from "./EventBusListener";
import { EventBusListenerContext } from "./EventBusListenerContext";

export const EventBusListener.make = <A extends IEventBusListener, R>(
	factory: (options: {
		parent: IEventBusListener;
	}) => E.Effect<A, never, R>,
) =>
	Layer.effect(
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
