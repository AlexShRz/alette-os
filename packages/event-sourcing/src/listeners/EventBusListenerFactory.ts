import * as Layer from "effect/Layer";
import { EventBusListener } from "./EventBusListener.js";

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
