import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { TapAbortMiddleware } from "./TapAbortMiddleware";
import { tapAbortMiddlewareSpecification } from "./tapAbortMiddlewareSpecification";

export type TTapAbortArgs<C extends IRequestContext = IRequestContext> = (
	requestContext: TFullRequestContext<C>,
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
		return <InContext extends IRequestContext>(
			args: TTapAbortArgs<InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof tapAbortMiddlewareSpecification,
				TTapAbortArgs<InContext>
			>({
				name: "tapAbort",
				lastArgs: args,
				middlewareSpec: tapAbortMiddlewareSpecification,
				middlewareFactory: (args) =>
					new TapAbortMiddlewareFactory(
						() => new TapAbortMiddleware(args as TTapAbortArgs),
					),
			});
		};
	}
}
