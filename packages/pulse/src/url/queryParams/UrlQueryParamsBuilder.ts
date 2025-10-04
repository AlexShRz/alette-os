import { StandardSchemaV1 } from "@standard-schema/spec";
import queryString from "query-string";
import { as, validateSchema } from "../../schema";
import { AbstractBuilder } from "../../utils/AbstractBuilder";
import { IQueryParams } from "./IQueryParams";
import { CannotSetQueryParamsError } from "./error/CannotSetQueryParamsError";

export type PossibleParamSupplier<
	QueryParams extends IQueryParams = IQueryParams,
> = URLSearchParams | QueryParams;

export class UrlQueryParamsBuilder<
	Params extends IQueryParams = IQueryParams,
> extends AbstractBuilder<UrlQueryParamsBuilder<Params>> {
	protected paramSchema = as<Params>();
	protected storedParams = {} as Params;
	protected converter: (params: Readonly<Params>) => string = (params) => {
		const hasParams = !!Object.keys(params).length;

		if (!hasParams) {
			return "";
		}

		return `?${queryString.stringify(params)}`;
	};

	get(): Readonly<Params> {
		return this.storedParams;
	}

	getSchema() {
		return this.paramSchema;
	}

	set<NewParams extends Params>(
		queryParams: NewParams,
	): UrlQueryParamsBuilder<Params> {
		try {
			this.storedParams = validateSchema(this.paramSchema, queryParams);
			return this;
		} catch (e) {
			throw new CannotSetQueryParamsError(queryParams, e);
		}
	}

	/**
	 * Passed function will be used to convert
	 * query params to the "?param1='...'" format.
	 * */
	setConverter(converter: typeof this.converter) {
		this.converter = converter;
		return this;
	}

	setSchema<NewParamType extends IQueryParams>(
		standardSchema: StandardSchemaV1<unknown, NewParamType>,
	): UrlQueryParamsBuilder<NewParamType> {
		this.paramSchema = standardSchema as any;
		return this as any;
	}

	static fromOrThrow(): UrlQueryParamsBuilder;
	static fromOrThrow<QueryParamType extends IQueryParams>(
		queryParams: PossibleParamSupplier<QueryParamType>,
	): UrlQueryParamsBuilder<QueryParamType>;
	static fromOrThrow<QueryParamType extends IQueryParams>(
		queryParams: PossibleParamSupplier,
		schema: StandardSchemaV1<unknown, QueryParamType>,
	): UrlQueryParamsBuilder<QueryParamType>;
	static fromOrThrow(
		queryParams?: PossibleParamSupplier,
		schema?: StandardSchemaV1,
	): UrlQueryParamsBuilder {
		if (!queryParams) {
			return new UrlQueryParamsBuilder();
		}

		if (queryParams instanceof URLSearchParams) {
			return UrlQueryParamsBuilder.fromUrlParams(queryParams, schema as any);
		}

		return new UrlQueryParamsBuilder().set(queryParams as any);
	}

	static fromUrlParams(paramInstance: URLSearchParams): UrlQueryParamsBuilder;
	static fromUrlParams<QueryParamType extends IQueryParams>(
		paramInstance: URLSearchParams,
		paramSchema: StandardSchemaV1<unknown, QueryParamType>,
	): UrlQueryParamsBuilder<QueryParamType>;
	static fromUrlParams(
		paramInstance: URLSearchParams,
		paramSchema?: StandardSchemaV1,
	) {
		const builder = new UrlQueryParamsBuilder();
		let extractedParams: Record<string, any> = {};

		for (const [key, value] of paramInstance.entries()) {
			extractedParams = { ...extractedParams, [key]: value };
		}

		if (paramSchema !== undefined) {
			return builder.setSchema(paramSchema as any).set(extractedParams as any);
		}

		return builder.set(extractedParams as any);
	}

	clone() {
		return this.cloneWith((self) => {
			return self
				.setSchema(this.getSchema())
				.setConverter(this.converter)
				.set(this.get());
		});
	}

	/**
	 * Converts stored query params to the "?param1='...'" format.
	 * */
	override toString() {
		return this.converter(this.storedParams);
	}
}
