import { FatalApiError } from "@alette/pulse";

export class ResponseValidationError extends FatalApiError {
	constructor(protected invalidResponse: unknown) {
		super(`Response value does not match schema: "${invalidResponse}"`);
	}

	getInvalidResponse() {
		return this.invalidResponse;
	}
}
