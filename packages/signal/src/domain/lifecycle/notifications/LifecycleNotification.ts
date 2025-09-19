import * as E from "effect/Effect";
import { RequestSessionEvent } from "../../execution/events/RequestSessionEvent";
import { sendSessionEvent } from "../../execution/utils/sendSessionEvent";

export abstract class LifecycleNotification {
	abstract toEvent(): E.Effect<RequestSessionEvent>;

	dispatch() {
		return E.gen(this, function* () {
			const event = yield* this.toEvent();
			yield* sendSessionEvent(event);
		});
	}
}
