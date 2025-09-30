import { FatalApiError } from "@alette/pulse";

export class TokenCredentialValidationError extends FatalApiError {
	constructor(
		protected invalidCredentials: unknown,
		protected issues: string = "",
	) {
		super("\nTokenCredentialValidationError" + `\n Issues: ${issues}`);
	}

	getInvalidCredentials() {
		return this.invalidCredentials;
	}
}
