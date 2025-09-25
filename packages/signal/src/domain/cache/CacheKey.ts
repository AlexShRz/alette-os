export class CacheKey {
	constructor(protected key: string) {}

	getId() {
		return this.key;
	}
}
