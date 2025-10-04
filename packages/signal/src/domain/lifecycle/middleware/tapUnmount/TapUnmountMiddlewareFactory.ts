import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { TapUnmountMiddleware } from "./TapUnmountMiddleware";
import { tapUnmountMiddlewareSpecification } from "./tapUnmountMiddlewareSpecification";

export type TTapUnmountArgs = (
	context: TRequestGlobalContext,
) => void | Promise<void>;

export class TapUnmountMiddlewareFactory extends Middleware(
	"TapTriggerMiddlewareFactory",
)(
	(getMiddleware: () => TapUnmountMiddleware) =>
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
		return <Context extends IRequestContext>(args: TTapUnmountArgs) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof tapUnmountMiddlewareSpecification
			>(
				() =>
					new TapUnmountMiddlewareFactory(
						() => new TapUnmountMiddleware(args as TTapUnmountArgs),
					),
			);
		};
	}
}
