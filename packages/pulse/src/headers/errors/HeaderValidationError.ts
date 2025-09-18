import { FatalApiError } from "../../error";

export class HeaderValidationError extends FatalApiError {
	constructor(protected invalidHeaders: unknown) {
		super();
	}

	getInvalidHeaders() {
		return this.invalidHeaders;
	}
}
