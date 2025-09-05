import { RequestSessionEvent } from "./RequestSessionEvent";

export class CancelRequest extends RequestSessionEvent {
	clone() {
		return new CancelRequest() as this;
	}
}
