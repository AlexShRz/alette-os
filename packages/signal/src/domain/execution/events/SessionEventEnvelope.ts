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
		return this.getWrappedEvent().unsafeGetRequestId() !== null;
	}

	setRequestId(id: string) {
		this.forEachEventLayer((e) => {
			if (e instanceof RequestSessionEvent) {
				e.setRequestId(id);
			}

			return e;
		});
		return this;
	}
}
