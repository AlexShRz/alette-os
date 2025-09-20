import { EventEnvelope, TMaybeWrappedEvent } from "../events";
import { DummyEvent } from "./DummyEvent";

export class DummyEventEnvelope extends EventEnvelope<DummyEvent> {
	protected count = 0;

	constructor(wrapped: TMaybeWrappedEvent<DummyEvent>) {
		super({
			wrapped,
			isWrapped: (event) => event instanceof DummyEvent,
		});
	}

	getValues() {
		return this.getWrappedEvent().getValues();
	}

	getOwnCount() {
		return this.count;
	}

	getValuesFromAllLayers() {
		let values: number[] = [];

		this.forEachEventLayer((event) => {
			if (event instanceof DummyEventEnvelope) {
				values.push(event.getOwnCount());
			}

			if (event instanceof DummyEvent) {
				values = [...values, ...event.getValues()];
			}

			return event;
		});

		return values;
	}

	setOwnCount(value: number) {
		this.count = value;
		return this;
	}

	forEachLayer(fn: (event: TMaybeWrappedEvent<DummyEvent>) => void) {
		this.forEachEventLayer((e) => {
			fn(e);
		});
	}

	updateValues(values: number[]) {
		this.getWrappedEvent().setValues(values);
		return this;
	}

	clone() {
		return new DummyEventEnvelope(this.config.wrapped.clone()) as this;
	}
}
