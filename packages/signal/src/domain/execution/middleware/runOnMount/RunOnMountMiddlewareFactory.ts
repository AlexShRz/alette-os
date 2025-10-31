import * as E from "effect/Effect";
import { IRequestContext } from "../../../context";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { RunOnMountMiddleware } from "./RunOnMountMiddleware";
import { runOnMountMiddlewareSpecification } from "./runOnMountMiddlewareSpecification";

export type TRunOnMountMiddlewareArgs =
	| boolean
	| ((requestContext: TRequestGlobalContext) => Promise<boolean> | boolean);

export class RunOnMountMiddlewareFactory extends Middleware(
	"RunOnMountMiddlewareFactory",
)(
	(getMiddleware: () => RunOnMountMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware(
									[RunOnMountMiddleware],
									[getMiddleware()],
								);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <InContext extends IRequestContext>(
			args?: TRunOnMountMiddlewareArgs,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof runOnMountMiddlewareSpecification,
				TRunOnMountMiddlewareArgs | undefined
			>({
				name: "runOnMount",
				lastArgs: args,
				middlewareSpec: runOnMountMiddlewareSpecification,
				middlewareFactory: (args) =>
					new RunOnMountMiddlewareFactory(() => new RunOnMountMiddleware(args)),
			});
		};
	}
}
