import { RequestSessionEvent } from "./RequestSessionEvent";

export class InterruptRequest extends RequestSessionEvent {
	protected _clone() {
		return new InterruptRequest() as this;
	}
}
