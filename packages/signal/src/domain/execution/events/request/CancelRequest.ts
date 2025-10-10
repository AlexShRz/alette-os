import { RequestSessionEvent } from "../RequestSessionEvent";

export class CancelRequest extends RequestSessionEvent {
	protected _clone() {
		return new CancelRequest() as this;
	}
}
