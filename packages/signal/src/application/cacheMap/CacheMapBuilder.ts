import { v4 as uuid } from "uuid";
import { CachePolicy, CachePolicyBuilder } from "../../domain/cache/policy";
import { TCachePolicySchemaArg } from "../../domain/cache/policy/CachePolicyBuilder";
import { TRequestGlobalContext } from "../../domain/context/typeUtils/RequestIOTypes";
import { TRecognizedApiDuration } from "../../shared";
import { PluginTaskScheduler } from "../plugins/PluginTaskScheduler";
import { CacheMap } from "./CacheMap";
import { CacheMapNameNotProvidedError } from "./errors/CacheMapNameNotProvidedError";

interface ICacheMapNameSupplier {
	(context: TRequestGlobalContext): string;
}

export class CacheMapBuilder<CacheableValue = unknown> {
	protected id = uuid();
	protected nameSupplier: ICacheMapNameSupplier | null = null;
	protected cachePolicy: CachePolicy<CacheableValue>;
	protected canStoreMax = 100;
	protected pruneAfterDuration: TRecognizedApiDuration = "15 seconds";

	constructor(
		protected scheduler: PluginTaskScheduler,
		cachePolicyOrSchema:
			| CachePolicy<CacheableValue>
			| TCachePolicySchemaArg<CacheableValue>,
	) {
		this.cachePolicy =
			cachePolicyOrSchema instanceof CachePolicy
				? cachePolicyOrSchema
				: new CachePolicyBuilder(cachePolicyOrSchema).build();
	}

	name(supplierOrName: ICacheMapNameSupplier | string) {
		this.nameSupplier =
			typeof supplierOrName === "string"
				? () => supplierOrName
				: supplierOrName;
		return this;
	}

	limit(canStoreMax: number) {
		this.canStoreMax = canStoreMax;
		return this;
	}

	pruneOlderThan(duration: TRecognizedApiDuration) {
		this.pruneAfterDuration = duration;
		return this;
	}

	protected assertNameSupplierProvided(): asserts this is {
		nameSupplier: ICacheMapNameSupplier;
	} {
		if (!this.nameSupplier) {
			throw new CacheMapNameNotProvidedError();
		}
	}

	build() {
		this.assertNameSupplierProvided();
		const cacheMap = new CacheMap(this.scheduler, {
			policy: this.cachePolicy,
			id: this.id,
			capacity: this.canStoreMax,
			entityPruningTimeout: this.pruneAfterDuration,
		});
		// TODO: Schedule task cache map activation task
		// and pass name supplier, id and policy to it

		return cacheMap;
	}
}
