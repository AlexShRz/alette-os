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
	C extends IRequestContext = IRequestContext,
	Method extends THttpMethod = THttpMethod,
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
		return <Context extends IRequestContext, Method extends THttpMethod>(
			supplier?: TMethodSupplier<Method, Context>,
		) =>
			new MiddlewareFacade<
				typeof methodMiddlewareSpecification,
				TMethodSupplier<Method, Context> | undefined,
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
