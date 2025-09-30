import { FatalApiError } from "@alette/pulse";

export class CookieCredentialValidationError extends FatalApiError {
	constructor(
		protected invalidCredentials: unknown,
		protected issues: string = "",
	) {
		super("\nCookieCredentialValidationError" + `\n Issues: ${issues}`);
	}

	getInvalidCredentials() {
		return this.invalidCredentials;
	}
}
