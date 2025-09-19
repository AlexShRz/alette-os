import { FatalApiError } from "../../error";

export class MethodValidationError extends FatalApiError {
	constructor(protected invalidMethod: unknown) {
		super();
	}

	getInvalidMethod() {
		return this.invalidMethod;
	}
}
