import { FatalApiError } from "../../error";

export class HttpMethodValidationError extends FatalApiError {
	constructor(protected invalidMethod: unknown) {
		super(
			"\nHttpMethodValidationError" +
				`\nValue "${invalidMethod}" is not a valid http method for this request type.`,
		);
	}

	getInvalidMethod() {
		return this.invalidMethod;
	}
}
