import { ResponseRef } from "../../../response/adapter/ResponseRef";
import { RequestSessionEvent } from "../RequestSessionEvent";

export class RequestSucceeded<Value = unknown> extends RequestSessionEvent {
	constructor(protected response: ResponseRef<Value>) {
		super();
	}

	getSuccessValue() {
		return this.response.unsafeGet();
	}

	clone() {
		return new RequestSucceeded(this.response.clone()) as this;
	}
}
