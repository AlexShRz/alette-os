import { Effect, all, andThen, gen } from "effect/Effect";
import { v4 as uuid } from "uuid";
import { CannotFindListenerEventBusContextError } from "../errors/CannotFindListenerEventBusContextError.js";
import { BusEvent } from "../events/BusEvent.js";

export interface BusEventListenerContext {
	sendToEventBus: EventBusDispatch;
	next: (event: BusEvent) => Effect<BusEvent, unknown, never>;
}

export interface EventBusDispatch {
	(event: BusEvent): Effect<BusEvent, unknown, never>;
}

export abstract class BusEventListener {
	public readonly _tag = "UnknownEventBusListener";
	protected id = uuid();
	protected priority = 0;
	protected context: BusEventListenerContext | null = null;

	protected onAttachListeners: Effect<void, unknown, never>[] = [];
	protected onShutdownListeners: Effect<void, unknown, never>[] = [];

	canReceiveCancelled() {
		return false;
	}

	canReceiveEventsSentBySelf() {
		return false;
	}

	getId() {
		return this.id;
	}

	getPriority() {
		return this.priority;
	}

	initialize() {
		return all(this.onAttachListeners, { discard: true });
	}

	bindContext(passedContext: BusEventListenerContext) {
		this.context = passedContext;
		return this;
	}

	protected abstract apply(
		event: BusEvent,
		context: BusEventListenerContext,
	): Effect<BusEvent, unknown, never>;

	send(event: BusEvent): Effect<BusEvent, unknown, never> {
		return gen(this, function* () {
			if (!this.context) {
				return yield* CannotFindListenerEventBusContextError.make({
					listener: this._tag,
				});
			}

			return yield* this.apply(event, this.context);
		});
	}

	whenAttached(listener: (typeof this.onAttachListeners)[number]) {
		this.onAttachListeners.push(listener);

		return () => {
			this.onAttachListeners = this.onAttachListeners.filter(
				(l) => l !== listener,
			);
		};
	}

	whenShutdown(listener: (typeof this.onShutdownListeners)[number]) {
		this.onShutdownListeners.push(listener);

		return () => {
			this.onShutdownListeners = this.onShutdownListeners.filter(
				(l) => l !== listener,
			);
		};
	}

	/**
	 * Event listeners should be cloneable
	 * */
	abstract clone(): Effect<this, never, never>;

	protected reset() {
		this.onAttachListeners = [];
		this.onShutdownListeners = [];
	}

	shutdown() {
		return all(this.onShutdownListeners, {
			concurrency: "unbounded",
			discard: true,
		}).pipe(andThen(() => this.reset()));
	}
}
