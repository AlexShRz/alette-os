import * as E from "effect/Effect";
import { Cookie, Token } from "../../../../application";
import { IRequestContext } from "../../../context/IRequestContext";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
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
			Context extends IRequestContext,
			AuthEntityType extends Token | Cookie,
		>(
			args: TBearerMiddlewareArgs<AuthEntityType>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					TMergeRecords<
						Context["value"],
						AuthEntityType extends Token
							? TBearerTokenHeaders<Context, AuthEntityType>
							: { credentials: "include" }
					>,
					Context["settings"],
					Context["accepts"],
					Context["acceptsMounted"]
				>,
				typeof bearerMiddlewareSpecification
			>(
				() =>
					new BearerMiddlewareFactory(
						() => new BearerMiddleware(args as TBearerMiddlewareArgs),
					),
			);
		};
	}
}
