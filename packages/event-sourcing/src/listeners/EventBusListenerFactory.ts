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
> {
	static as<
		Tag extends string,
		LayerType extends EventBusListener,
		LayerReturn extends IEventBusListener,
		Exceptions,
	>(tag: Tag, passedConfig: Partial<IEventBusListenerFactoryConfig> = {}) {
		return <Args extends any[]>(
			factory: (
				...args: Args
			) => IEventBusListenerFactory<LayerReturn, Exceptions, never>,
		) =>
			class extends EventBusListenerFactory<Tag, LayerType> {
				constructor(...factoryArgs: Args extends [] ? [] : Args) {
					super(
						tag,
						() =>
							EventBusListener.make<LayerReturn, Exceptions, never>(
								factory(...(factoryArgs as Args)),
							),
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
		public layerFactory: () => Layer.Layer<A>,
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
