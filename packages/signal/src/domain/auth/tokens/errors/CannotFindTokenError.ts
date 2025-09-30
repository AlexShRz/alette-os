import { FatalApiError } from "@alette/pulse";

export class CannotFindTokenError extends FatalApiError {
	constructor(protected tokenId: string) {
		super(
			"\nCannotFindTokenError" + `\nToken with id "${tokenId}" was not found.`,
		);
	}

	getTokenId() {
		return this.tokenId;
	}
}
