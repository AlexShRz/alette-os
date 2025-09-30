import { ApiError } from "@alette/pulse";

export class TokenCredentialsNotSetError extends ApiError {
	constructor() {
		super("TokenCredentialsNotSetError");
	}

	cloneSelf() {
		return new TokenCredentialsNotSetError();
	}
}
