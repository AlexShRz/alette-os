import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { OriginMiddleware } from "./OriginMiddleware";
import { IRequestOrigin, TGetRequestOrigin } from "./RequestOrigin";
import { originMiddlewareSpecification } from "./originMiddlewareSpecification";

export type TOriginMiddlewareArgs<
	NewOrigin extends string = string,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			context: TFullRequestContext<C>,
			prevPath: TGetRequestOrigin<C>,
	  ) => NewOrigin | Promise<NewOrigin>)
	| NewOrigin;

export class OriginMiddlewareFactory extends Middleware(
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
		return <InContext extends IRequestContext, Origin extends string>(
			args?: TOriginMiddlewareArgs<Origin, InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof originMiddlewareSpecification,
				TOriginMiddlewareArgs<Origin, InContext> | undefined,
				[
					IRequestContextPatch<{
						value: IRequestOrigin<Origin>;
					}>,
				]
			>({
				name: "origin",
				lastArgs: args,
				middlewareSpec: originMiddlewareSpecification,
				middlewareFactory: (args) =>
					new OriginMiddlewareFactory(
						() => new OriginMiddleware(args as TOriginMiddlewareArgs),
					),
			});
		};
	}
}
