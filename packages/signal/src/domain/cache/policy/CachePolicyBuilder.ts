import { ISchema } from "@alette/pulse";
import * as P from "effect/Predicate";
import isEqual from "fast-deep-equal";
import { responseAdapter } from "../../index";
import { ResponseAdapter } from "../../response/adapter/ResponseAdapter";
import { TCacheableId } from "../CacheTypes";
import { CachePolicyEntityIdExtractionError } from "../errors/CachePolicyEntityIdExtractionError";
import { CachePolicy } from "./CachePolicy";

export type TCachePolicySchemaArg<CacheableValue = unknown> =
	| ResponseAdapter<CacheableValue>
	| ISchema<unknown, CacheableValue>;

export interface IEntityIdExtractor<CacheableValue = unknown> {
	(entity: CacheableValue): TCacheableId;
}

export interface IEntityEqualityCheck<CacheableValue = unknown> {
	(options: { current: CacheableValue; next: CacheableValue }): boolean;
}

export class CachePolicyBuilder<CacheableValue = unknown> {
	protected valueAdapter: ResponseAdapter<CacheableValue>;
	protected idExtractor: IEntityIdExtractor<CacheableValue> =
		this.getDefaultIdExtractor();
	protected entityEqualityCheck: IEntityEqualityCheck<CacheableValue> =
		this.getDefaultEntityEqualityCheck();

	constructor(valueAdapterOrSchema: TCachePolicySchemaArg<CacheableValue>) {
		if (valueAdapterOrSchema instanceof ResponseAdapter) {
			this.valueAdapter = valueAdapterOrSchema;
			return;
		}

		this.valueAdapter = responseAdapter().schema(valueAdapterOrSchema).build();
	}

	protected getDefaultIdExtractor(): IEntityIdExtractor<CacheableValue> {
		return (entity) => {
			if (!P.hasProperty(entity, "id")) {
				throw new CachePolicyEntityIdExtractionError(entity);
			}

			const extractedId = entity.id;

			if (!P.isString(extractedId) && !P.isNumber(extractedId)) {
				throw new CachePolicyEntityIdExtractionError(entity);
			}

			return extractedId;
		};
	}

	protected getDefaultEntityEqualityCheck(): IEntityEqualityCheck<CacheableValue> {
		return ({ current, next }) => isEqual(current, next);
	}

	takeId(idExtractor: IEntityIdExtractor<CacheableValue>) {
		this.idExtractor = idExtractor;
		return this;
	}

	shouldUpdate(equalityCheck: IEntityEqualityCheck<CacheableValue>) {
		this.entityEqualityCheck = equalityCheck;
		return this;
	}

	build() {
		return new CachePolicy({
			idExtractor: this.idExtractor,
			entityAdapter: this.valueAdapter,
			equalityChecker: this.entityEqualityCheck,
		});
	}
}
