import { FatalApiError } from "@alette/pulse";

export class ArgumentValidationError extends FatalApiError {
	constructor(
		protected invalidArgs: unknown,
		protected originalError: unknown = null,
	) {
		const issues =
			originalError instanceof Error ? originalError.message : "Unknown";
		super("ArgumentValidationError" + `\nIssues - ${issues}`);
	}

	getInvalidArgs() {
		return this.invalidArgs;
	}
}
