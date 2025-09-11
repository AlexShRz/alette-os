import { Exception } from "@alette/pulse";

export class RequestArgValidationException extends Exception.AsFatal(
	"RequestArgValidationException",
) {
	constructor(args: unknown) {
		super(
			`Passed request arguments do not match schema. Arguments - "${args}"`,
		);
	}
}
