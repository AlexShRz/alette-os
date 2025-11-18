import { FatalApiError } from "@alette/pulse";

export class MiddlewareWasNotInitializedError extends FatalApiError {
	constructor(middlewareName: string, lastArgs: unknown = undefined) {
		super(
			"\nMiddlewareWasNotInitializedError\n" +
				`Could not initialize middleware "${middlewareName}()".\n` +
				`Last passed arguments - "${lastArgs}".`,
		);
	}
}
