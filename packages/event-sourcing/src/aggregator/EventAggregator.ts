import { Array, Schema as S } from "effect";
import { Effect, void as Void, all, gen } from "effect/Effect";
import { PersistentEvent } from "../events/PersistentEvent.js";
import { BusEventListener } from "../listeners/BusEventListener.js";

export class EventAggregator extends S.TaggedClass<EventAggregator>()(
	"EventAggregator",
	{},
) {
	protected events = Array.empty<PersistentEvent>();

	isEmpty() {
		return this.events.length === 0;
	}

	count() {
		return this.events.length;
	}

	update(setter: (events: PersistentEvent[]) => Effect<PersistentEvent[]>) {
		return gen(this, function* () {
			this.events = yield* setter(this.events);
		});
	}

	save(event: PersistentEvent) {
		return gen(this, function* () {
			return yield* event.persist(this);
		});
	}

	replayLast(listener: BusEventListener) {
		const last = this.events[this.events.length - 1];

		if (!last) {
			return Void;
		}

		return last.project(listener);
	}

	replayAll(listener: BusEventListener) {
		return all(this.events.map((e) => e.project(listener)));
	}

	replaySelected(
		listener: BusEventListener,
		predicate: (event: PersistentEvent) => boolean,
	) {
		return all(this.events.filter(predicate).map((e) => e.project(listener)));
	}
}
