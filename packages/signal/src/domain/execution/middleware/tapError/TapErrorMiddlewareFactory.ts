import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { TGetRecognizedRequestErrors } from "../../../errorHandling/middleware/throws/RequestRecoverableErrors";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { TapErrorMiddleware } from "./TapErrorMiddleware";
import { tapErrorMiddlewareSpecification } from "./tapErrorMiddlewareSpecification";

export type TTapErrorArgs<C extends IRequestContext = IRequestContext> = (
	error: TGetRecognizedRequestErrors<C>,
	requestContext: TGetAllRequestContext<C>,
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
		return <Context extends IRequestContext>(args: TTapErrorArgs<Context>) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof tapErrorMiddlewareSpecification
			>(
				() =>
					new TapErrorMiddlewareFactory(
						() => new TapErrorMiddleware(args as TTapErrorArgs),
					),
			);
		};
	}
}
