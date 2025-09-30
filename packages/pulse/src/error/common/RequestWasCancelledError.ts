import { ApiError } from "./ApiError";

export class RequestWasCancelledError extends ApiError {
	constructor() {
		super();
	}

	cloneSelf() {
		return new RequestWasCancelledError();
	}
}
