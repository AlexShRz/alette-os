import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import {
	TGetAllRequestContext,
	TRequestResponse,
} from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { TapMiddleware } from "./TapMiddleware";
import { tapMiddlewareSpecification } from "./tapMiddlewareSpecification";

export type TTapArgs<C extends IRequestContext = IRequestContext> = (
	response: TRequestResponse<C>,
	requestContext: TGetAllRequestContext<C>,
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
		return <Context extends IRequestContext>(args: TTapArgs<Context>) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof tapMiddlewareSpecification
			>(
				() =>
					new TapMiddlewareFactory(() => new TapMiddleware(args as TTapArgs)),
			);
		};
	}
}
