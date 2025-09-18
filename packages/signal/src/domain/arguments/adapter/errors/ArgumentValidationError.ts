import { FatalApiError } from "@alette/pulse";

export class ArgumentValidationError extends FatalApiError {
	constructor(protected invalidArgs: unknown) {
		super(
			`Passed request arguments do not match schema. Arguments - "${invalidArgs}"`,
		);
	}

	getInvalidArgs() {
		return this.invalidArgs;
	}
}
