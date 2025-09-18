import { FatalApiError } from "@alette/pulse";

export class UnknownErrorCaught extends FatalApiError {
	constructor(protected unknownError: unknown) {
		super();
	}

	getUnknownError(): unknown {
		return this.unknownError;
	}
}
