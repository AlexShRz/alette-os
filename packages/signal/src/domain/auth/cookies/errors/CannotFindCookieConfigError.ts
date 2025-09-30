import { FatalApiError } from "@alette/pulse";

export class CannotFindCookieConfigError extends FatalApiError {
	constructor(protected cookieId: string) {
		super("CannotFindCookieConfigError");
	}

	getCookieId() {
		return this.cookieId;
	}
}
