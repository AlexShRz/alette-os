import { ApiError } from "./ApiError";

export class RequestAbortedError extends ApiError {
	constructor() {
		super("RequestAbortedError" + `\nThe request was aborted.`);
	}

	cloneSelf() {
		return new RequestAbortedError();
	}
}
