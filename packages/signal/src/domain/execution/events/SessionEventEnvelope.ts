import { EventEnvelope } from "@alette/event-sourcing";
import { v4 as uuid } from "uuid";
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

	getRequestId() {
		return this.getWrappedEvent().getRequestId();
	}

	setRequestId(id?: string) {
		const requestId = id || uuid();

		this.forEachEventLayer((e) => {
			if (e instanceof RequestSessionEvent) {
				e.setRequestId(requestId);
			}

			return e;
		});
		return this;
	}
}
