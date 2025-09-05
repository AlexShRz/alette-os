import * as DateTime from "effect/DateTime";
import * as E from "effect/Effect";
import { v4 as uuid } from "uuid";

export abstract class BusEvent {
	/**
	 * All these props should be reset during event cloning.
	 * */
	protected eventStatus: "completed" | "cancelled" | "undetermined" =
		"undetermined";
	protected dispatchedBy: string | null = null;
	protected createdAt = DateTime.unsafeNow();
	protected cancellationHooks: ((self: this) => E.Effect<void, unknown>)[] = [];
	protected completionHooks: ((self: this) => E.Effect<void, unknown>)[] = [];

	constructor(protected id = uuid()) {}

	isCancelled() {
		return this.eventStatus === "cancelled";
	}

	isCompleted() {
		return this.eventStatus === "completed";
	}

	isUndetermined() {
		return !this.isCompleted() && !this.isCancelled();
	}

	getId() {
		return this.id;
	}

	getCreationTime() {
		return this.createdAt;
	}

	getDispatchedBy() {
		return this.dispatchedBy;
	}

	setDispatchedBy(listenerId: string) {
		this.dispatchedBy = listenerId;
		return this;
	}

	cancel() {
		if (!this.isUndetermined()) {
			return E.void;
		}

		return E.all(this.cancellationHooks.map((hook) => hook(this))).pipe(
			E.andThen(
				E.sync(() => {
					this.eventStatus = "cancelled";
				}),
			),
			E.orDie,
		);
	}

	complete() {
		if (!this.isUndetermined()) {
			return E.void;
		}

		return E.all(this.completionHooks.map((hook) => hook(this))).pipe(
			E.andThen(
				E.sync(() => {
					this.eventStatus = "completed";
				}),
			),
			E.orDie,
		);
	}

	onCancel(hook: (typeof this.cancellationHooks)[number]) {
		this.cancellationHooks = [...this.cancellationHooks, hook];
		return this;
	}

	onComplete(hook: (typeof this.completionHooks)[number]) {
		this.completionHooks = [...this.completionHooks, hook];
		return this;
	}

	abstract clone(): this;
}
