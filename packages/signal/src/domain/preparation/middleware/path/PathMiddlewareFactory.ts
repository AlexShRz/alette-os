import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeContextAdapters } from "../../../context/typeUtils/TMergeContextAdapters";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { UrlContext } from "../../context/url/UrlContext";
import { PathMiddleware } from "./PathMiddleware";
import { IRequestPath, TGetRequestPath } from "./RequestPath";
import { pathMiddlewareSpecification } from "./pathMiddlewareSpecification";

type TStrictPath = `/${string}`;

export type TPathMiddlewareArgs<
	NextPath extends TStrictPath = TStrictPath,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			prevPath: TGetRequestPath<C>,
			context: TGetAllRequestContext<C>,
	  ) => NextPath | Promise<NextPath>)
	| NextPath;

export class PathMiddlewareFactory extends Middleware("PathMiddlewareFactory")(
	(getMiddleware: () => PathMiddleware) =>
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
		return <Context extends IRequestContext, Path extends TStrictPath>(
			args: TPathMiddlewareArgs<Path, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TMergeContextAdapters<Context, UrlContext>,
					TMergeRecords<Context["value"], IRequestPath<Path>>,
					Context["settings"],
					Context["accepts"],
					Context["acceptsMounted"]
				>,
				typeof pathMiddlewareSpecification
			>(
				() =>
					new PathMiddlewareFactory(
						() => new PathMiddleware(args as TPathMiddlewareArgs),
					),
			);
		};
	}
}
