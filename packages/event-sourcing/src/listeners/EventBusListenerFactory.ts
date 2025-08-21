import * as Layer from "effect/Layer";
import { EventBusListener } from "./EventBusListener.js";

export class EventBusListenerFactory<
	A extends EventBusListener = EventBusListener,
	R = never,
> {
	protected config: {
		priority: number;
		canReceiveCompleted: boolean;
		canReceiveCancelled: boolean;
		canReceiveEventsSentBySelf: boolean;
	} = {
		priority: 0,
		canReceiveCompleted: false,
		canReceiveCancelled: false,
		canReceiveEventsSentBySelf: false,
	};

	constructor(
		protected layerFactory: () => Layer.Layer<A, never, R>,
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
