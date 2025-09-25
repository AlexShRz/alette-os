import { ResponseAdapter } from "../../response/adapter/ResponseAdapter";
import { IEntityEqualityCheck, IEntityIdExtractor } from "./CachePolicyBuilder";

export class CachePolicy<CacheableValue = unknown> {
	constructor(
		protected config: {
			entityAdapter: ResponseAdapter<CacheableValue>;
			equalityChecker: IEntityEqualityCheck<CacheableValue>;
			idExtractor: IEntityIdExtractor<CacheableValue>;
		},
	) {}
}
