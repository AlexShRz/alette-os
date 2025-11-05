import { IQueryParams } from "@alette/pulse";
import { TIsExactlyLeft } from "@alette/type-utils";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { QueryParamsMiddleware } from "./QueryParamsMiddleware";
import { QueryParamsMiddlewareFactory } from "./QueryParamsMiddlewareFactory";
import {
	IRequestQueryParams,
	TGetRequestQueryParams,
} from "./RequestQueryParams";
import { queryParamsMiddlewareSpecification } from "./queryParamsMiddlewareSpecification";

export type TQueryParamsMiddlewareArgs<
	NextQueryParams extends IQueryParams = IQueryParams,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			context: TFullRequestContext<C>,
			prevParams: TGetRequestQueryParams<C>,
	  ) => NextQueryParams | Promise<NextQueryParams>)
	| NextQueryParams;

export class QueryParams<
	InContext extends IRequestContext,
	PassedQueryParams extends IQueryParams,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, PassedQueryParams extends IQueryParams>(
		args: TQueryParamsMiddlewareArgs<PassedQueryParams, _InContext>,
	) => QueryParams<_InContext, PassedQueryParams>,
	InContext,
	[
		IRequestContextPatch<{
			value: IRequestQueryParams<
				TIsExactlyLeft<IQueryParams, PassedQueryParams> extends true
					? {}
					: PassedQueryParams
			>;
		}>,
	],
	typeof queryParamsMiddlewareSpecification
> {
	protected middlewareSpec = queryParamsMiddlewareSpecification;

	constructor(
		protected override lastArgs: TQueryParamsMiddlewareArgs<any, any> = {},
	) {
		super((args) => new QueryParams(args));
	}

	getMiddleware() {
		return new QueryParamsMiddlewareFactory(
			() => new QueryParamsMiddleware(this.lastArgs),
		);
	}
}

export const queryParams = new QueryParams();
