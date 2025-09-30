import { FatalApiError } from "@alette/pulse";

export class CannotFindCookieConfigError extends FatalApiError {
	constructor(protected cookieId: string) {
		super();
	}

	getCookieId() {
		return this.cookieId;
	}
}
