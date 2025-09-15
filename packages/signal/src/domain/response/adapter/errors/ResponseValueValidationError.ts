import { ApiError } from "@alette/pulse";

export class ResponseValueValidationError extends ApiError.AsFatal(
	"ResponseValueValidationError",
) {
	constructor(value: unknown) {
		super(`Response value does not match schema: "${value}"`);
	}
}
