import { ApiException } from "@alette/pulse";

export class RequestInterruptedException extends ApiException.AsFatal(
	"RequestInterruptedException",
) {
	cloneSelf() {
		return new RequestInterruptedException();
	}
}
