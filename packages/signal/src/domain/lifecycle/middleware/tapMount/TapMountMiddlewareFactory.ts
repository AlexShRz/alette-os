import * as E from "effect/Effect";
import { IRequestContext } from "../../../context";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { TapMountMiddleware } from "./TapMountMiddleware";
import { tapMountMiddlewareSpecification } from "./tapMountMiddlewareSpecification";

export type TTapMountArgs = (
	context: TRequestGlobalContext,
) => void | Promise<void>;

export class TapMountMiddlewareFactory extends Middleware(
	"TapMountMiddlewareFactory",
)(
	(getMiddleware: () => TapMountMiddleware) =>
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
		return <InContext extends IRequestContext>(args: TTapMountArgs) => {
			return new MiddlewareFacade<
				InContext,
				typeof tapMountMiddlewareSpecification,
				TTapMountArgs
			>({
				name: "tapMount",
				lastArgs: args,
				middlewareSpec: tapMountMiddlewareSpecification,
				middlewareFactory: (args) =>
					new TapMountMiddlewareFactory(() => new TapMountMiddleware(args)),
			});
		};
	}
}
