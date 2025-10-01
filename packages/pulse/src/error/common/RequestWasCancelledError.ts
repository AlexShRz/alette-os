import { ApiError } from "./ApiError";

export class RequestWasCancelledError extends ApiError {
	constructor() {
		super("RequestWasCancelledError");
	}

	cloneSelf() {
		return new RequestWasCancelledError();
	}
}
