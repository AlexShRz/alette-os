import { FatalApiError } from "@alette/pulse";

export class TokenCredentialValidationError extends FatalApiError {
	constructor(protected invalidCredentials: unknown) {
		super();
	}

	getInvalidCredentials() {
		return this.invalidCredentials;
	}
}
