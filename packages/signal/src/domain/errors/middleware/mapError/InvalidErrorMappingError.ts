import { FatalApiError } from "@alette/pulse";

export class InvalidErrorMappingError extends FatalApiError {
	constructor(protected invalidError: unknown) {
		super(
			"\nInvalidErrorMappingError\n" +
				`1. Incorrectly mapped error in mapError() caught.\n` +
				`2. Make sure your mapped error extends the "ApiError" class.`,
		);
	}

	getInvalidError() {
		return this.invalidError;
	}
}
