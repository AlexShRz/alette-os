import { FatalApiError } from "@alette/pulse";

export class RequestArgValidationError extends FatalApiError {
	constructor(args: unknown) {
		super(
			`Passed request arguments do not match schema. Arguments - "${args}"`,
		);
	}
}
