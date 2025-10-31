import * as E from "effect/Effect";
import { Cookie, Token } from "../../../../application";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { BearerMiddleware } from "./BearerMiddleware";
import { TBearerTokenHeaders } from "./BearerTypes";
import { bearerMiddlewareSpecification } from "./bearerMiddlewareSpecification";

export type TBearerMiddlewareArgs<
	Entity extends Token | Cookie = Token | Cookie,
> = ((context: TRequestGlobalContext) => Entity | Promise<Entity>) | Entity;

export class BearerMiddlewareFactory extends Middleware(
	"BearerMiddlewareFactory",
)(
	(getMiddleware: () => BearerMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware([BearerMiddleware], [getMiddleware()]);
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
			AuthEntityType extends Token | Cookie,
		>(
			args: TBearerMiddlewareArgs<AuthEntityType>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof bearerMiddlewareSpecification,
				TBearerMiddlewareArgs<AuthEntityType>,
				[
					IRequestContextPatch<{
						value: AuthEntityType extends false
							? { credentials: false }
							: AuthEntityType extends Token
								? TBearerTokenHeaders<InContext, AuthEntityType>
								: { credentials: "include" };
					}>,
				]
			>({
				name: "bearer",
				lastArgs: args,
				middlewareSpec: bearerMiddlewareSpecification,
				middlewareFactory: (args) =>
					new BearerMiddlewareFactory(
						() => new BearerMiddleware(args as TBearerMiddlewareArgs),
					),
			});
		};
	}
}
