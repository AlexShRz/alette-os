import { ApiError } from "./ApiError";

export class RequestCancelledError extends ApiError {
	constructor() {
		super("RequestCancelledError");
	}

	cloneSelf() {
		return new RequestCancelledError();
	}
}
