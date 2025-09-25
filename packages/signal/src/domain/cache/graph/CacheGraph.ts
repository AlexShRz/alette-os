import { Graph } from "@datastructures-js/graph";
import type { Ctor } from "effect/Types";
import { CacheEntry } from "../CacheEntry";
import { CacheKey } from "../CacheKey";
import { CachePolicy } from "../policy";

export interface ICacheGraphMutationActionResult {
	deletedEntries: CacheEntry[];
	addedEntries: CacheEntry[];
	setEntries: CacheEntry[];
}

export interface ICacheKeyGetterPredicate {
	(key: CacheKey): boolean;
}

export interface ICacheEntryGetterPredicate {
	(entry: CacheEntry): boolean;
}

/**
 * string - vertex id
 * number - weight
 * */
export interface IGraphConnectedEdges extends Record<string, number> {}

export type TGraphValue = CacheEntry | CacheKey;

export class CacheGraph extends Graph<string, TGraphValue> {
	protected knownKeys: string[] = [];

	constructor(protected cachePolicy: CachePolicy) {
		super();
	}

	protected getFirstKnownKey() {
		return this.knownKeys[0];
	}

	override getConnectedEdges(id: string): IGraphConnectedEdges {
		return super.getConnectedEdges(id);
	}

	findVertex<V extends TGraphValue>(
		predicate: (value: V) => boolean,
		ctor: Ctor<V extends CacheEntry ? CacheEntry : CacheKey>,
	): V | null {
		const firstKey = this.getFirstKnownKey();

		if (!firstKey) {
			return null;
		}

		let found: V | null = null;
		this.traverseBfs(
			firstKey,
			(_, value) => {
				if (!(value instanceof ctor)) {
					return;
				}

				const currentValue = value as unknown as V;

				if (predicate(currentValue)) {
					found = currentValue;
				}
			},
			() => !!found,
		);

		return found;
	}

	findVertexes<V extends TGraphValue>(
		predicate: (value: V) => boolean,
		ctor: Ctor<V extends CacheEntry ? CacheEntry : CacheKey>,
	): V[] {
		const firstKey = this.getFirstKnownKey();

		if (!firstKey) {
			return [];
		}

		const collected: V[] = [];
		this.traverseBfs(firstKey, (_, value) => {
			if (!(value instanceof ctor)) {
				return;
			}

			const currentValue = value as unknown as V;

			if (predicate(currentValue)) {
				collected.push(currentValue);
			}
		});

		return collected;
	}

	override addVertex(key: string, vertex: TGraphValue) {
		this.knownKeys.push(key);
		return super.addVertex(key, vertex);
	}

	override removeVertex(key: string) {
		this.knownKeys = this.knownKeys.filter((k) => k !== key);
		return super.removeVertex(key);
	}
}
