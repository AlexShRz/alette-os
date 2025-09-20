import { FatalApiError } from "../../error";

export class BodyCloningError extends FatalApiError {
	constructor(protected invalidBody: unknown) {
		super();
	}

	getInvalidBody() {
		return this.invalidBody;
	}
}
