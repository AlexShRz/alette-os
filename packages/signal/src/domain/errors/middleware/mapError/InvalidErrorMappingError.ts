import { FatalApiError } from "@alette/pulse";

export class InvalidErrorMappingError extends FatalApiError {
	constructor(protected invalidError: unknown) {
		super();
	}

	getInvalidError() {
		return this.invalidError;
	}
}
