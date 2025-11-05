import { FatalApiError } from "@alette/pulse";

export class MiddlewareWasNotInitializedError extends FatalApiError {
	constructor(middlewareName: string, lastArgs: unknown = "") {
		super(
			"\nMiddlewareWasNotInitializedError\n" +
				`Could not middleware "${middlewareName}()".\n` +
				`Last passed arguments - "${lastArgs}".`,
		);
	}
}
