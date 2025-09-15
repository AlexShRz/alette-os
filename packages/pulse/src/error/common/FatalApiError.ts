import { RuntimeException } from "effect/Cause";

export abstract class FatalApiError extends RuntimeException {
	protected customName: string = "UnknownFatalApiError";

	getName() {
		return this.customName;
	}
}
