import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { TapCancelMiddleware } from "./TapCancelMiddleware";
import { tapCancelMiddlewareSpecification } from "./tapCancelMiddlewareSpecification";

export type TTapCancelArgs<C extends IRequestContext = IRequestContext> = (
	requestContext: TGetAllRequestContext<C>,
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
		return <Context extends IRequestContext>(args: TTapCancelArgs<Context>) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof tapCancelMiddlewareSpecification
			>(
				() =>
					new TapCancelMiddlewareFactory(
						() => new TapCancelMiddleware(args as TTapCancelArgs),
					),
			);
		};
	}
}
