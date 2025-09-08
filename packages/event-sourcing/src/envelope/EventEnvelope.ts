import { BusEvent } from "../events";

export type TMaybeWrappedEvent<T extends BusEvent = BusEvent> =
	| T
	| EventEnvelope<T>;

export abstract class EventEnvelope<
	T extends BusEvent = BusEvent,
> extends BusEvent {
	constructor(
		protected config: {
			isWrapped: (event: unknown) => boolean;
			wrapped: TMaybeWrappedEvent<T>;
		},
	) {
		super();
	}

	protected isUnwrappedEvent(event: unknown): event is T {
		return this.config.isWrapped(event);
	}

	getWrappedEvent() {
		return this.unwrapLayers(this.config.wrapped);
	}

	peel() {
		return this.config.wrapped;
	}

	protected unwrapLayers(event: TMaybeWrappedEvent<T>): T {
		return this.isUnwrappedEvent(event)
			? event
			: this.unwrapLayers(event.getWrappedEvent());
	}

	protected forEachWrapped(
		fn: (prevEvent: TMaybeWrappedEvent<T>) => TMaybeWrappedEvent<T>,
		prevEvent: TMaybeWrappedEvent<T>,
	) {
		const returned = fn(prevEvent);
		if (this.isUnwrappedEvent(returned)) {
			return;
		}

		this.forEachWrapped(fn, returned.getWrappedEvent());
	}
}
