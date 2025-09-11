import { Exception } from "@alette/pulse";

export class ResponseValueValidationException extends Exception.AsFatal(
	"ResponseValueValidationException",
) {
	constructor(value: unknown) {
		super(`Response value does not match schema: "${value}"`);
	}
}
