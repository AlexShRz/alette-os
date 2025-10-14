import { FatalApiError } from "@alette/pulse";

export class TokenTypeValidationError extends FatalApiError {
	constructor(protected invalidToken: unknown) {
		const tokenType = typeof invalidToken;

		super(
			"\nTokenTypeValidationError" +
				`\n Invalid token type - expected "string", got "${tokenType}".` +
				`\n Token value - "${invalidToken}".`,
		);
	}

	getInvalidToken() {
		return this.invalidToken;
	}
}
