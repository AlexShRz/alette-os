import { RequestSessionEvent } from "../RequestSessionEvent";

export class AbortRequest extends RequestSessionEvent {
	protected _clone() {
		return new AbortRequest() as this;
	}
}
