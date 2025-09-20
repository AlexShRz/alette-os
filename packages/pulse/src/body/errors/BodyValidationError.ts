import { FatalApiError } from "../../error";

export class BodyValidationError extends FatalApiError {
	constructor(protected invalidBody: unknown) {
		super();
	}

	getInvalidBody() {
		return this.invalidBody;
	}
}
