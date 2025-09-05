import * as Layer from "effect/Layer";
import * as P from "effect/Predicate";
import {
	EventBusListener,
	IEventBusListener,
	IEventBusListenerFactory,
} from "./EventBusListener.js";

export interface IEventBusListenerFactoryConfig {
	priority: number;
	canReceiveCompleted: boolean;
	canReceiveCancelled: boolean;
	canReceiveEventsSentBySelf: boolean;
}

export class EventBusListenerFactory<
	Tag extends string = string,
	A extends EventBusListener = EventBusListener,
	R = never,
> {
	static as<
		T extends string,
		A extends EventBusListener,
		I extends IEventBusListener,
	>(tag: T, passedConfig: Partial<IEventBusListenerFactoryConfig> = {}) {
		return <Args extends any[], R>(
			factory: (...args: Args) => IEventBusListenerFactory<I, R>,
		) =>
			class extends EventBusListenerFactory<T, A, R> {
				constructor(...factoryArgs: Args extends [] ? [] : Args) {
					super(
						tag,
						() =>
							EventBusListener.make<I, R>(factory(...(factoryArgs as Args))),
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
	}

	public config: IEventBusListenerFactoryConfig = {
		priority: 0,
		canReceiveCompleted: false,
		canReceiveCancelled: false,
		canReceiveEventsSentBySelf: false,
	};

	constructor(
		public readonly _tag: Tag,
		public layerFactory: () => Layer.Layer<A, never, R>,
		/**
		 * These settings are taken into account ONLY during
		 * first listener construction. They cannot be changed later,
		 * so it makes no sense to include them into the listener itself.
		 * */
		passedConfig: Partial<{
			priority: number;
			canReceiveCompleted: boolean;
			canReceiveCancelled: boolean;
			canReceiveEventsSentBySelf: boolean;
		}> = {},
	) {
		this.config = {
			...this.config,
			...passedConfig,
		};
	}

	getTag() {
		return this._tag;
	}

	getPriority() {
		return this.config.priority;
	}

	canReceiveCompleted() {
		return this.config.canReceiveCompleted || false;
	}

	canReceiveCancelled() {
		return this.config.canReceiveCancelled || false;
	}

	canReceiveEventsSentBySelf() {
		return this.config.canReceiveEventsSentBySelf || false;
	}

	toLayer() {
		return this.layerFactory();
	}
}
