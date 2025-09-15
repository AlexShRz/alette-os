import { ApiError } from "@alette/pulse";

export class RequestArgValidationError extends ApiError.AsFatal(
	"RequestArgValidationError",
) {
	constructor(args: unknown) {
		super(
			`Passed request arguments do not match schema. Arguments - "${args}"`,
		);
	}
}
