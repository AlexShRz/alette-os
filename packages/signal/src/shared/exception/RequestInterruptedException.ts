import { ApiException } from "@alette/pulse";

export class RequestInterruptedException extends ApiException.AsFatal(
	"RequestInterruptedException",
) {
	constructor() {
		super();
	}

	cloneSelf() {
		return new RequestInterruptedException();
	}
}
