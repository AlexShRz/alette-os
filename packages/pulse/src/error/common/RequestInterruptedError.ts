import { ApiError } from "./ApiError";

export class RequestInterruptedError extends ApiError {
	cloneSelf() {
		return new RequestInterruptedError();
	}
}
