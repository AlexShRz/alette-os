import { FatalApiError } from "@alette/pulse";

export class UnrecognizedErrorCaught extends FatalApiError {
	constructor(protected unrecognizedError: unknown) {
		super();
	}

	getUnrecognizedError(): unknown {
		return this.unrecognizedError;
	}
}
