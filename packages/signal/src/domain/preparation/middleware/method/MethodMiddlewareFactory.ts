import { THttpMethod } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { IRequestMethod } from "../../context/method/RequestMethod";
import { MethodMiddleware } from "./MethodMiddleware";
import { methodMiddlewareSpecification } from "./methodMiddlewareSpecification";

export type TMethodSupplier<
	Method extends THttpMethod = THttpMethod,
	C extends IRequestContext = IRequestContext,
> =
	| ((requestContext: TFullRequestContext<C>) => Method | Promise<Method>)
	| Method;

export class MethodMiddlewareFactory extends Middleware(
	"MethodMiddlewareFactory",
)(
	(getMiddleware: () => MethodMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware([MethodMiddleware], [getMiddleware()]);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <InContext extends IRequestContext, Method extends THttpMethod>(
			supplier?: TMethodSupplier<Method, InContext>,
		) =>
			new MiddlewareFacade<
				InContext,
				typeof methodMiddlewareSpecification,
				TMethodSupplier<Method, InContext> | undefined,
				[
					IRequestContextPatch<{
						value: IRequestMethod<Method>;
					}>,
				]
			>({
				name: "method",
				lastArgs: supplier,
				middlewareSpec: methodMiddlewareSpecification,
				middlewareFactory: (args) =>
					new MethodMiddlewareFactory(
						() => new MethodMiddleware(args as TMethodSupplier),
					),
			});
	}
}
