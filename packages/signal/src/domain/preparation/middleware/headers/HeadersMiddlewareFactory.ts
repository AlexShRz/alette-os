import { IHeaders } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import {
	IRequestHeaders,
	TGetRequestHeaders,
} from "../../context/headers/RequestHeaders";
import { HeadersMiddleware } from "./HeadersMiddleware";
import { headersMiddlewareSpecification } from "./headersMiddlewareSpecification";

export type THeaderSupplier<
	Headers extends IHeaders = IHeaders,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			requestContext: TFullRequestContext<C>,
			prevHeaders: TGetRequestHeaders<C>,
	  ) => Headers | Promise<Headers>)
	| Headers;

export class HeadersMiddlewareFactory extends Middleware(
	"HeadersMiddlewareFactory",
)(
	(getMiddleware: () => HeadersMiddleware) =>
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
		return <InContext extends IRequestContext, Headers extends IHeaders>(
			headerSupplier: THeaderSupplier<Headers, InContext>,
		) =>
			new MiddlewareFacade<
				InContext,
				typeof headersMiddlewareSpecification,
				THeaderSupplier<Headers, InContext>,
				[
					IRequestContextPatch<{
						value: IRequestHeaders<Headers>;
					}>,
				]
			>({
				name: "headers",
				lastArgs: headerSupplier,
				middlewareSpec: headersMiddlewareSpecification,
				middlewareFactory: (args) =>
					new HeadersMiddlewareFactory(
						() => new HeadersMiddleware(args as THeaderSupplier),
					),
			});
	}
}
