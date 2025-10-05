import { ApiError } from "./ApiError";

export class RequestAbortedError extends ApiError {
	constructor() {
		super("RequestAbortedError");
	}

	cloneSelf() {
		return new RequestAbortedError();
	}
}
