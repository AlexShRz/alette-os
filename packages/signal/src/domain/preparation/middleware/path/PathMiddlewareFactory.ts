import * as E from "effect/Effect";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { PathMiddleware } from "./PathMiddleware";
import { IRequestPath, TGetRequestPath } from "./RequestPath";
import { pathMiddlewareSpecification } from "./pathMiddlewareSpecification";

type TStrictPath = `/${string}`;

export type TPathMiddlewareArgs<
	NextPath extends TStrictPath = TStrictPath,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			context: TFullRequestContext<C>,
			prevPath: TGetRequestPath<C>,
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
		return <InContext extends IRequestContext, Path extends TStrictPath>(
			args: TPathMiddlewareArgs<Path, InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof pathMiddlewareSpecification,
				TPathMiddlewareArgs<Path, InContext>,
				[
					IRequestContextPatch<{
						value: IRequestPath<Path>;
					}>,
				]
			>({
				name: "path",
				lastArgs: args,
				middlewareSpec: pathMiddlewareSpecification,
				middlewareFactory: (args) =>
					new PathMiddlewareFactory(
						() => new PathMiddleware(args as TPathMiddlewareArgs),
					),
			});
		};
	}
}
