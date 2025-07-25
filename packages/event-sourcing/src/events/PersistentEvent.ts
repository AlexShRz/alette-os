import { Effect, andThen, gen, succeed, zipRight } from "effect/Effect";
import { EventAggregator } from "../aggregator/EventAggregator.js";
import { BusEventListener } from "../listeners/BusEventListener.js";
import { BusEvent } from "./BusEvent.js";

export abstract class PersistentEvent extends BusEvent {
	persist(aggregator: EventAggregator): Effect<boolean, unknown, never> {
		return zipRight(
			aggregator.update((events) =>
				this.clone().pipe(andThen((event) => succeed([...events, event]))),
			),
			succeed(true),
		);
	}

	project(listener: BusEventListener): Effect<void, unknown, never> {
		return gen(this, function* () {
			yield* listener.send(yield* this.clone());
		});
	}
}
