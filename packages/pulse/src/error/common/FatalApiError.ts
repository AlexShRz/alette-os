import { YieldableError } from "effect/Cause";

export abstract class FatalApiError extends YieldableError {
	public readonly _tag = "FatalApiError" as const;

	getName() {
		return this._tag;
	}
}
