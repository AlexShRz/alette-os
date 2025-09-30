import { ApiError } from "@alette/pulse";

export class CookieCredentialsNotSetError extends ApiError {
	constructor() {
		super();
	}

	cloneSelf() {
		return new CookieCredentialsNotSetError();
	}
}
