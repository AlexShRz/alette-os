import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { TapAbortMiddleware } from "./TapAbortMiddleware";
import { tapAbortMiddlewareSpecification } from "./tapAbortMiddlewareSpecification";

export type TTapAbortArgs<C extends IRequestContext = IRequestContext> = (
	requestContext: TGetAllRequestContext<C>,
) => void | Promise<void>;

export class TapAbortMiddlewareFactory extends Middleware(
	"TapAbortMiddlewareFactory",
)(
	(getMiddleware: () => TapAbortMiddleware) =>
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
		return <Context extends IRequestContext>(args: TTapAbortArgs<Context>) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof tapAbortMiddlewareSpecification
			>(
				() =>
					new TapAbortMiddlewareFactory(
						() => new TapAbortMiddleware(args as TTapAbortArgs),
					),
			);
		};
	}
}
