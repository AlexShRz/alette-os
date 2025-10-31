import { IQueryParams } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
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
			context: TFullRequestContext<C>,
			prevParams: TGetRequestQueryParams<C>,
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
		return <
			InContext extends IRequestContext,
			QueryParams extends IQueryParams,
		>(
			args: TQueryParamsMiddlewareArgs<QueryParams, InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof queryParamsMiddlewareSpecification,
				TQueryParamsMiddlewareArgs<QueryParams, InContext>,
				[
					IRequestContextPatch<{
						value: IRequestQueryParams<QueryParams>;
					}>,
				]
			>({
				name: "queryParams",
				lastArgs: args,
				middlewareSpec: queryParamsMiddlewareSpecification,
				middlewareFactory: (args) =>
					new QueryParamsMiddlewareFactory(
						() => new QueryParamsMiddleware(args as TQueryParamsMiddlewareArgs),
					),
			});
		};
	}
}
