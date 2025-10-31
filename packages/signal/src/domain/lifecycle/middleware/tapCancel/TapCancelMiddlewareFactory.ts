import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { TapCancelMiddleware } from "./TapCancelMiddleware";
import { tapCancelMiddlewareSpecification } from "./tapCancelMiddlewareSpecification";

export type TTapCancelArgs<C extends IRequestContext = IRequestContext> = (
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapCancelMiddlewareFactory extends Middleware(
	"TapCancelMiddlewareFactory",
)(
	(getMiddleware: () => TapCancelMiddleware) =>
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
			args: TTapCancelArgs<InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof tapCancelMiddlewareSpecification,
				TTapCancelArgs<InContext>
			>({
				name: "tapCancel",
				lastArgs: args,
				middlewareSpec: tapCancelMiddlewareSpecification,
				middlewareFactory: (args) =>
					new TapCancelMiddlewareFactory(
						() => new TapCancelMiddleware(args as TTapCancelArgs),
					),
			});
		};
	}
}
