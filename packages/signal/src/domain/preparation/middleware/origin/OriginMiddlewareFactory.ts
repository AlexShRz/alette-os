import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { OriginMiddleware } from "./OriginMiddleware";
import { IRequestOrigin, TGetRequestOrigin } from "./RequestOrigin";
import { originMiddlewareSpecification } from "./originMiddlewareSpecification";

export type TOriginMiddlewareArgs<
	NewOrigin extends string = string,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			context: TGetAllRequestContext<C>,
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
		return <Context extends IRequestContext, Origin extends string>(
			args?: TOriginMiddlewareArgs<Origin, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					TMergeRecords<Context["value"], IRequestOrigin<Origin>>,
					Context["settings"],
					Context["accepts"],
					Context["acceptsMounted"]
				>,
				typeof originMiddlewareSpecification
			>(
				() =>
					new OriginMiddlewareFactory(
						() => new OriginMiddleware(args as TOriginMiddlewareArgs),
					),
			);
		};
	}
}
