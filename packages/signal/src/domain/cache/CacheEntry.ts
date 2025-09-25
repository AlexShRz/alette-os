import { TCacheableId } from "./CacheTypes";

export class CacheEntry {
	constructor(
		protected config: {
			id: TCacheableId;
		},
	) {}

	/**
	 * 1. Must always return string, even
	 * if the original id is a number.
	 * 2. This is needed for graphs
	 * */
	getId() {
		return `${this.config.id}`;
	}
}
