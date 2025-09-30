import { FatalApiError } from "@alette/pulse";

export class UnknownErrorCaught extends FatalApiError {
	constructor(protected unknownError: unknown) {
		super(
			"\nUnknownErrorCaught\n" +
				`Caught error converted to string - "${unknownError}"`,
		);
	}

	getUnknownError(): unknown {
		return this.unknownError;
	}
}
