import { RequestSessionEvent } from "../RequestSessionEvent";
import { RunRequest } from "../request/RunRequest";

export class WithReloadableCheck extends RequestSessionEvent {
	protected constructor(protected wrappedEvent: RunRequest) {
		super();
	}

	override setRequestId(id: string) {
		super.setRequestId(id);
		this.wrappedEvent.setRequestId(id);
		return this;
	}

	clone() {
		return new WithReloadableCheck(this.wrappedEvent.clone()) as this;
	}
}
