import { ApiError } from "@alette/pulse";

export class RequestInterruptedError extends ApiError {
	cloneSelf() {
		return new RequestInterruptedError();
	}
}
