import { Exception } from "@alette/pulse";

export class RequestInterruptedException extends Exception.As(
	"RequestInterruptedException",
) {
	cloneSelf() {
		return new RequestInterruptedException();
	}
}
