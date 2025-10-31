import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { TapLoadingMiddleware } from "./TapLoadingMiddleware";
import { tapLoadingMiddlewareSpecification } from "./tapLoadingMiddlewareSpecification";

export type TTapLoadingArgs<C extends IRequestContext = IRequestContext> = (
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapLoadingMiddlewareFactory extends Middleware(
	"TapMiddlewareFactory",
)(
	(getMiddleware: () => TapLoadingMiddleware) =>
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
		return <InContext extends IRequestContext>(
			args: TTapLoadingArgs<InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof tapLoadingMiddlewareSpecification,
				TTapLoadingArgs<InContext>
			>({
				name: "tapLoadingMiddleware",
				lastArgs: args,
				middlewareSpec: tapLoadingMiddlewareSpecification,
				middlewareFactory: (args) =>
					new TapLoadingMiddlewareFactory(
						() => new TapLoadingMiddleware(args as TTapLoadingArgs),
					),
			});
		};
	}
}
