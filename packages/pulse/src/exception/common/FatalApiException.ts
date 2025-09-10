import { RuntimeException } from "effect/Cause";

export abstract class FatalApiException extends RuntimeException {
	protected customName: string = "UnknownFatalApiException";

	getName() {
		return this.customName;
	}
}
