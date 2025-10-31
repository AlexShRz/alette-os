import * as E from "effect/Effect";
import { IRequestContext } from "../../../context";
import {
	TFullRequestContext,
	TRequestError,
} from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { TapErrorMiddleware } from "./TapErrorMiddleware";
import { tapErrorMiddlewareSpecification } from "./tapErrorMiddlewareSpecification";

export type TTapErrorArgs<C extends IRequestContext = IRequestContext> = (
	error: TRequestError<C>,
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapErrorMiddlewareFactory extends Middleware(
	"TapErrorMiddlewareFactory",
)(
	(getMiddleware: () => TapErrorMiddleware) =>
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
			args: TTapErrorArgs<InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof tapErrorMiddlewareSpecification,
				TTapErrorArgs<InContext>
			>({
				name: "tapError",
				lastArgs: args,
				middlewareSpec: tapErrorMiddlewareSpecification,
				middlewareFactory: (args) =>
					new TapErrorMiddlewareFactory(
						() => new TapErrorMiddleware(args as TTapErrorArgs),
					),
			});
		};
	}
}
