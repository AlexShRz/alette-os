import { FatalApiError } from "@alette/pulse";

export class MiddlewareWasNotInitializedError extends FatalApiError {
	constructor(middlewareName: string, message: string) {
		super(
			"\nMiddlewareWasNotInitializedError\n" +
				`Could not middleware "${middlewareName}()".\n` +
				`${message}`,
		);
	}
}
