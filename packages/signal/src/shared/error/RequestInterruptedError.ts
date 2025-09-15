import { ApiError } from "@alette/pulse";

export class RequestInterruptedError extends ApiError.AsFatal(
	"RequestInterruptedError",
) {
	cloneSelf() {
		return new RequestInterruptedError();
	}
}
