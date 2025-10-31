import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { TapUnmountMiddleware } from "./TapUnmountMiddleware";
import { tapUnmountMiddlewareSpecification } from "./tapUnmountMiddlewareSpecification";

export type TTapUnmountArgs = (
	context: TRequestGlobalContext,
) => void | Promise<void>;

export class TapUnmountMiddlewareFactory extends Middleware(
	"TapUnmountMiddlewareFactory",
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
		return <InContext extends IRequestContext>(args: TTapUnmountArgs) => {
			return new MiddlewareFacade<
				InContext,
				typeof tapUnmountMiddlewareSpecification,
				TTapUnmountArgs
			>({
				name: "tapUnmount",
				lastArgs: args,
				middlewareSpec: tapUnmountMiddlewareSpecification,
				middlewareFactory: (args) =>
					new TapUnmountMiddlewareFactory(() => new TapUnmountMiddleware(args)),
			});
		};
	}
}
