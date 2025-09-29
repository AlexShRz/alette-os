import { FatalApiError } from "@alette/pulse";

export class CannotFindTokenError extends FatalApiError {
	constructor(protected tokenId: string) {
		super();
	}

	getTokenId() {
		return this.tokenId;
	}
}
