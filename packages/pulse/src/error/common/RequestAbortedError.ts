import { ApiError } from "./ApiError";

export class RequestAbortedError extends ApiError {
	constructor() {
		super("\nRequestAbortedError" + `\nThe request was aborted.`);
	}

	cloneSelf() {
		return new RequestAbortedError();
	}
}
