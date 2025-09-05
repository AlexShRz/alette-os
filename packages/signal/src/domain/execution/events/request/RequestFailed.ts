import { ApiException } from "@alette/pulse";
import { RequestSessionEvent } from "../RequestSessionEvent";

export class RequestFailed<
	ErrorType extends ApiException = ApiException,
> extends RequestSessionEvent {
	constructor(protected passedError: ErrorType) {
		super();
	}

	getError() {
		return this.passedError;
	}

	clone() {
		return new RequestFailed(this.passedError.clone()) as this;
	}
}
