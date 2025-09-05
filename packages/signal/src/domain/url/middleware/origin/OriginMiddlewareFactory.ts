import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeContextAdapters } from "../../../context/typeUtils/TMergeContextAdapters";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/AggregateRequestMiddleware";
import { RequestMiddleware } from "../../../middleware/RequestMiddleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { UrlContext } from "../../UrlContext";
import { OriginMiddleware } from "./OriginMiddleware";
import { IRequestOrigin, TGetRequestOrigin } from "./RequestOrigin";
import { originMiddlewareSpecification } from "./originMiddlewareSpecification";

export type TOriginMiddlewareArgs<
	NewOrigin extends string = string,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			prevPath: TGetRequestOrigin<C>,
			context: TGetAllRequestContext<C>,
	  ) => NewOrigin)
	| NewOrigin;

export class OriginMiddlewareFactory extends RequestMiddleware.as(
	"OriginMiddlewareFactory",
)(
	(getMiddleware: () => OriginMiddleware) =>
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
		return <Context extends IRequestContext, Origin extends string>(
			args?: TOriginMiddlewareArgs<Origin, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TMergeContextAdapters<Context, UrlContext>,
					TMergeRecords<Context["value"], IRequestOrigin<Origin>>,
					Context["meta"],
					Context["settings"],
					Context["accepts"]
				>,
				typeof originMiddlewareSpecification
			>(() => new OriginMiddleware(args as TOriginMiddlewareArgs));
		};
	}
}
