import { THttpBody } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { IRequestBody } from "../../context/body/RequestBody";
import { BodyMiddleware } from "./BodyMiddleware";
import { bodyMiddlewareSpecification } from "./bodyMiddlewareSpecification";

export type TBodySupplier<
	NextBody extends THttpBody = THttpBody,
	C extends IRequestContext = IRequestContext,
> =
	| ((requestContext: TFullRequestContext<C>) => NextBody | Promise<NextBody>)
	| NextBody;

export class BodyMiddlewareFactory extends Middleware("BodyMiddlewareFactory")(
	(getMiddleware: () => BodyMiddleware) =>
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
		return <InContext extends IRequestContext, NewBody extends THttpBody>(
			bodySupplier: TBodySupplier<NewBody, InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof bodyMiddlewareSpecification,
				TBodySupplier<NewBody, InContext>,
				[
					IRequestContextPatch<{
						value: IRequestBody<NewBody>;
					}>,
					/**
					 * 1. If our headers are non-existent,
					 * set empty record to act as a header type.
					 * 2. This allows us to access this property in context
					 * without getting ts errors, while also keeping system
					 * injected body headers hidden from the type system.
					 * */
					IRequestContextPatch<
						{
							value: {
								headers: {};
							};
						},
						"merge"
					>,
				]
			>({
				name: "body",
				lastArgs: bodySupplier,
				middlewareSpec: bodyMiddlewareSpecification,
				middlewareFactory: (args) =>
					new BodyMiddlewareFactory(
						() => new BodyMiddleware(args as TBodySupplier),
					),
			});
		};
	}
}
