import { RequestSessionEvent } from "../RequestSessionEvent";

export class RequestLoading extends RequestSessionEvent {
	clone() {
		return new RequestLoading() as this;
	}
}
