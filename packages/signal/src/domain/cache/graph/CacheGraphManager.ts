import { CacheEntry } from "../CacheEntry";
import { CacheKey } from "../CacheKey";
import { CachePolicy } from "../policy";
import {
	CacheGraph,
	ICacheEntryGetterPredicate,
	ICacheKeyGetterPredicate,
} from "./CacheGraph";

export class CacheGraphManager {
	protected graph: CacheGraph;

	constructor(protected cachePolicy: CachePolicy) {
		this.graph = new CacheGraph(cachePolicy);
	}

	getEntry(predicate: ICacheEntryGetterPredicate) {
		return this.graph.findVertex(predicate, CacheEntry);
	}

	getEntries(predicate: ICacheEntryGetterPredicate): CacheEntry[] {
		return this.graph.findVertexes(predicate, CacheEntry);
	}

	getCacheKey(predicate: ICacheKeyGetterPredicate) {
		return this.graph.findVertex(predicate, CacheKey);
	}

	getCacheKeys(predicate: ICacheKeyGetterPredicate) {
		return this.graph.findVertexes(predicate, CacheKey);
	}

	setEntry(entry: CacheEntry) {
		const currentEntryId = entry.getId();
		const prevEntry = this.getEntry((e) => e.getId() === currentEntryId);

		if (!prevEntry) {
			this.graph.addVertex(currentEntryId, entry);
			return;
		}

		const prevEntryEdges = this.graph.getConnectedEdges(prevEntry.getId());
	}

	setEntries(entries: CacheEntry[]) {}

	setLinkedEntries(cacheKey: string, entries: CacheEntry[]) {}

	removeCacheKey(cacheKey: string) {}

	removeEntry(id: string) {}

	removeEntries(ids: string[]) {}
}
