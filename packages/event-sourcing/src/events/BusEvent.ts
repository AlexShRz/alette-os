import * as DateTime from "effect/DateTime";
import { Effect } from "effect/Effect";
import { v4 as uuid } from "uuid";
import { BusEventListener } from "../listeners/BusEventListener.js";

export abstract class BusEvent {
	protected wasCancelled = false;
	protected dispatchedBy: string | null = null;
	protected createdAt = DateTime.unsafeNow();

	constructor(protected id = uuid()) {}

	isCancelled() {
		return this.wasCancelled;
	}

	isDispatchedBy(listener: BusEventListener) {
		return listener.getId() === this.dispatchedBy;
	}

	isOlderThan(event: BusEvent) {
		return DateTime.greaterThan(
			this.getCreationTime(),
			event.getCreationTime(),
		);
	}

	getId() {
		return this.id;
	}

	getCreationTime() {
		return this.createdAt;
	}

	setDispatchedBy(listenerId: string) {
		this.dispatchedBy = listenerId;
		return this;
	}

	/**
	 * Events should be cloneable, if not, an error should be thrown
	 * */
	abstract clone(): Effect<this, never, never>;
}
