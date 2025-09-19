import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { TapTriggerMiddleware } from "./TapTriggerMiddleware";
import { tapTriggerMiddlewareSpecification } from "./tapTriggerMiddlewareSpecification";

export type TTapTriggerArgs = (
	context: TRequestGlobalContext,
) => void | Promise<void>;

export class TapTriggerMiddlewareFactory extends Middleware(
	"TapTriggerMiddlewareFactory",
)(
	(getMiddleware: () => TapTriggerMiddleware) =>
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
		return <Context extends IRequestContext>(args: TTapTriggerArgs) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof tapTriggerMiddlewareSpecification
			>(
				() =>
					new TapTriggerMiddlewareFactory(
						() => new TapTriggerMiddleware(args as TTapTriggerArgs),
					),
			);
		};
	}
}
