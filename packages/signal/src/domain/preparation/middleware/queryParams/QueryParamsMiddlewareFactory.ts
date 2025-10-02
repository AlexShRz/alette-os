import { IQueryParams } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { QueryParamsMiddleware } from "./QueryParamsMiddleware";
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
			prevPath: TGetRequestQueryParams<C>,
			context: TGetAllRequestContext<C>,
	  ) => NextQueryParams | Promise<NextQueryParams>)
	| NextQueryParams;

export class QueryParamsMiddlewareFactory extends Middleware(
	"QueryParamsMiddlewareFactory",
)(
	(getMiddleware: () => QueryParamsMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.addMiddleware(getMiddleware());
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <Context extends IRequestContext, QueryParams extends IQueryParams>(
			args: TQueryParamsMiddlewareArgs<QueryParams, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					TMergeRecords<Context["value"], IRequestQueryParams<QueryParams>>,
					Context["settings"],
					Context["accepts"],
					Context["acceptsMounted"]
				>,
				typeof queryParamsMiddlewareSpecification
			>(
				() =>
					new QueryParamsMiddlewareFactory(
						() => new QueryParamsMiddleware(args as TQueryParamsMiddlewareArgs),
					),
			);
		};
	}
}
