import { Exception } from "@alette/pulse";

export class CannotParseResponseValueException extends Exception.AsFatal(
	"CannotParseResponseValueException",
) {
	constructor(value: unknown) {
		super(`Response value does not match schema: "${value}"`);
	}
}
