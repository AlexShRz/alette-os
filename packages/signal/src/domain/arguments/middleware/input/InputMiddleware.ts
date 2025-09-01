import { EventBusListener } from "@alette/event-sourcing";
import { EventBusListenerTag, IEventBusListener } from "@alette/event-sourcing";
import { StandardSchemaV1, type } from "@alette/pulse";
import * as E from "effect/Effect";

export interface IInputMiddlewareArgSchema<Output = unknown>
	extends StandardSchemaV1<unknown, Output> {}

export type InputMiddlewareArgProvider<Value = unknown> =
	| (() => Value)
	| undefined;

export class InputMiddleware extends E.Service<EventBusListener>()(
	EventBusListenerTag,
	{
		scoped: E.fn(function* (
			argSchema: IInputMiddlewareArgSchema = type(),
			defaultArgProvider: InputMiddlewareArgProvider,
		) {
			const { base, context } = yield* EventBusListener.parent();

			return {
				...base,
				send(e) {
					return E.gen(this, function* () {
						return yield* context.next(e);
					});
				},
			} satisfies IEventBusListener;
		}),
	},
) {}
