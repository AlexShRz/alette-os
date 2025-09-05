import * as P from "effect/Predicate";
import {
	EventBusListener,
	IEventBusListener,
	IEventBusListenerFactory,
} from "./EventBusListener";
import {
	EventBusListenerFactory,
	IEventBusListenerFactoryConfig,
} from "./EventBusListenerFactory";

export const Listener = <
	T extends string,
	A extends EventBusListener,
	I extends IEventBusListener,
>(
	tag: T,
	passedConfig: Partial<IEventBusListenerFactoryConfig> = {},
) => {
	return <Args extends any[], R>(
		factory: (...args: Args) => IEventBusListenerFactory<I, R>,
	) =>
		class extends EventBusListenerFactory<T, A, R> {
			constructor(...factoryArgs: Args extends [] ? [] : Args) {
				super(
					tag,
					() => EventBusListener.make<I, R>(factory(...(factoryArgs as Args))),
					passedConfig,
				);
			}

			static override [Symbol.hasInstance](obj: unknown) {
				return (
					P.hasProperty(obj, "getTag") &&
					typeof obj.getTag === "function" &&
					obj.getTag() === tag
				);
			}
		};
};
