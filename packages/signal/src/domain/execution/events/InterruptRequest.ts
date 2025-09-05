import { RequestSessionEvent } from "./RequestSessionEvent";

export class InterruptRequest extends RequestSessionEvent {
	clone() {
		return new InterruptRequest() as this;
	}
}
