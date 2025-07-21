import * as DateTime from "effect/DateTime";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
import { BusEventListener } from "../listeners/BusEventListener.js";

export abstract class BusEvent extends S.TaggedClass<BusEvent>()("BusEvent", {
	id: S.optionalWith(S.String, {
		default: () => uuid(),
	}),
	dispatchedBy: S.optionalWith(S.Union(S.UUID, S.Null), {
		default: () => null,
	}),
	createdAt: S.optionalWith(S.DateTimeUtc, {
		default: () => DateTime.unsafeNow(),
	}),
}) {
	protected wasCancelled = false;
	protected overriddenDispatchedBy = this.dispatchedBy;

	isCancelled() {
		return this.wasCancelled;
	}

	isDispatchedBy(listener: BusEventListener) {
		return listener.getId() === this.overriddenDispatchedBy;
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
		this.overriddenDispatchedBy = listenerId;
		return this;
	}

	/**
	 * Events should be cloneable, if not, an error should be thrown
	 * */
	abstract clone(): this;
}
