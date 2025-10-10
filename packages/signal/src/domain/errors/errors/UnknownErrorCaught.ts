import { FatalApiError } from "@alette/pulse";

export class UnknownErrorCaught extends FatalApiError {
	constructor(protected unknownError: unknown) {
		super("\nUnknownErrorCaught\n" + `Caught error - "${unknownError}"`);
	}

	getUnknownError(): unknown {
		return this.unknownError;
	}
}
