import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import {
	TFullRequestContext,
	TRequestResponse,
} from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { TapMiddleware } from "./TapMiddleware";
import { tapMiddlewareSpecification } from "./tapMiddlewareSpecification";

export type TTapArgs<C extends IRequestContext = IRequestContext> = (
	response: TRequestResponse<C>,
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapMiddlewareFactory extends Middleware("TapMiddlewareFactory")(
	(getMiddleware: () => TapMiddleware) =>
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
		return <InContext extends IRequestContext, ResponseValue>(
			args: TTapArgs<InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof tapMiddlewareSpecification,
				TTapArgs<InContext>
			>({
				name: "tap",
				lastArgs: args,
				middlewareSpec: tapMiddlewareSpecification,
				middlewareFactory: (args) =>
					new TapMiddlewareFactory(() => new TapMiddleware(args as TTapArgs)),
			});
		};
	}
}
