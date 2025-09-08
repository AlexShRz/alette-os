import { EventEnvelope } from "@alette/event-sourcing";
import { RequestSessionEvent } from "./RequestSessionEvent";
import { IRequestSessionEvent } from "./SessionEvent";

export abstract class SessionEventEnvelope<
		T extends RequestSessionEvent = RequestSessionEvent,
	>
	extends EventEnvelope<T>
	implements IRequestSessionEvent
{
	hasRequestId() {
		return this.getWrappedEvent().getRequestId() !== null;
	}

	setRequestId(id: string) {
		this.forEachWrapped((e) => {
			if (e instanceof RequestSessionEvent) {
				e.setRequestId(id);
			}

			return e;
		}, this.config.wrapped);
		return this;
	}
}
