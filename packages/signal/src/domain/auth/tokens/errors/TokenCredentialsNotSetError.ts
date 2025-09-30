import { ApiError } from "@alette/pulse";

export class TokenCredentialsNotSetError extends ApiError {
	constructor() {
		super();
	}

	cloneSelf() {
		return new TokenCredentialsNotSetError();
	}
}
