import * as E from "effect/Effect";
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

	override complete(): E.Effect<void> {
		const collectedHooks: E.Effect<void>[] = [
			super.getCompletionHookExecutor(),
		];

		this.forEachEventLayer((event) => {
			collectedHooks.push(event.getCompletionHookExecutor());
		});

		return E.all(collectedHooks);
	}

	override cancel(): E.Effect<void> {
		const collectedHooks: E.Effect<void>[] = [
			super.getCancellationHookExecutor(),
		];

		this.forEachEventLayer((event) => {
			collectedHooks.push(event.getCancellationHookExecutor());
		});

		return E.all(collectedHooks);
	}

	protected unwrapAllLayers(event: TMaybeWrappedEvent<T>): T {
		return this.isUnwrappedEvent(event)
			? event
			: this.unwrapAllLayers(event.getWrappedEvent());
	}

	protected forEachEventLayer(fn: (prevEvent: TMaybeWrappedEvent<T>) => void) {
		const iterate = (currentEvent: TMaybeWrappedEvent<T>) => {
			fn(currentEvent);

			/**
			 * If we've reached the last wrapped event
			 * stop the loop.
			 * */
			if (this.isUnwrappedEvent(currentEvent)) {
				return;
			}

			return iterate(currentEvent.peel());
		};

		return iterate(this.config.wrapped);
	}
}
