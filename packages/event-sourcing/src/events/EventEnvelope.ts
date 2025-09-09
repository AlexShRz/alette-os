import { BusEvent } from "./index";

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
		return this.unwrapAllLayers(this.config.wrapped);
	}

	peel() {
		return this.config.wrapped;
	}

	protected unwrapAllLayers(event: TMaybeWrappedEvent<T>): T {
		return this.isUnwrappedEvent(event)
			? event
			: this.unwrapAllLayers(event.getWrappedEvent());
	}

	protected forEachEventLayer(
		fn: (prevEvent: TMaybeWrappedEvent<T>) => TMaybeWrappedEvent<T>,
	) {
		const iterate = (prevEvent: TMaybeWrappedEvent<T>) => {
			const returned = fn(prevEvent);

			/**
			 * If we've reached the last wrapped event
			 * stop the loop.
			 * */
			if (this.isUnwrappedEvent(returned)) {
				return;
			}

			return iterate(returned.peel());
		};

		return iterate(this.config.wrapped);
	}
}
