import { FatalApiError } from "@alette/pulse";

export class CachePolicyEntityIdExtractionError extends FatalApiError {
	constructor(protected invalidEntity: unknown) {
		super();
	}

	getInvalidEntity() {
		return this.invalidEntity;
	}
}
