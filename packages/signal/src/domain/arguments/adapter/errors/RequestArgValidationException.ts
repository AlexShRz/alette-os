import { ApiException } from "@alette/pulse";

export class RequestArgValidationException extends ApiException.AsFatal(
	"RequestArgValidationException",
) {
	constructor(args: unknown) {
		super(
			`Passed request arguments do not match schema. Arguments - "${args}"`,
		);
	}
}
