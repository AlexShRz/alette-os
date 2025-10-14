import { FatalApiError } from "@alette/pulse";

export class RefreshTokenTypeValidationError extends FatalApiError {
	constructor(protected invalidToken: unknown) {
		const tokenType = typeof invalidToken;

		super(
			"\nRefreshTokenTypeValidationError" +
				`\n Invalid refresh token type - expected "string", got "${tokenType}".` +
				`\n Refresh token value - "${invalidToken}".`,
		);
	}

	getInvalidRefreshToken() {
		return this.invalidToken;
	}
}
