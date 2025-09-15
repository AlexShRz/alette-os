import { ApiException } from "@alette/pulse";

export class ResponseValueValidationException extends ApiException.AsFatal(
	"ResponseValueValidationException",
) {
	constructor(value: unknown) {
		super(`Response value does not match schema: "${value}"`);
	}
}
