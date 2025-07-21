import { Effect, gen, succeed, zipRight } from "effect/Effect";
import { EventAggregator } from "../aggregator/EventAggregator.js";
import { BusEventListener } from "../listeners/BusEventListener.js";
import { BusEvent } from "./BusEvent.js";

export abstract class PersistentEvent extends BusEvent.extend<PersistentEvent>(
	"PersistentEvent",
)({}) {
	persist(aggregator: EventAggregator): Effect<boolean, unknown, never> {
		return zipRight(
			aggregator.update((events) => succeed([...events, this.clone()])),
			succeed(true),
		);
	}

	project(listener: BusEventListener): Effect<void, unknown, never> {
		return gen(this, function* () {
			yield* listener.send(this.clone());
		});
	}
}
