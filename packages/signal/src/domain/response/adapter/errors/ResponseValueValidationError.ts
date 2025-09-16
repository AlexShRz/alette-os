import { FatalApiError } from "@alette/pulse";

export class ResponseValueValidationError extends FatalApiError {
	constructor(value: unknown) {
		super(`Response value does not match schema: "${value}"`);
	}
}
