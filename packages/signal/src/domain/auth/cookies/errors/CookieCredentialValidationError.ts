import { FatalApiError } from "@alette/pulse";

export class CookieCredentialValidationError extends FatalApiError {
	constructor(protected invalidCredentials: unknown) {
		super();
	}

	getInvalidCredentials() {
		return this.invalidCredentials;
	}
}
