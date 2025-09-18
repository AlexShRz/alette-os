import { IHeaders } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeContextAdapters } from "../../../context/typeUtils/TMergeContextAdapters";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { HeaderContext } from "../../HeaderContext";
import { IRequestHeaders, TGetRequestHeaders } from "../../RequestHeaders";
import { HeadersMiddleware } from "./HeadersMiddleware";
import { headersMiddlewareSpecification } from "./headersMiddlewareSpecification";

export type THeaderSupplier<
	Headers extends IHeaders = IHeaders,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			headers: TGetRequestHeaders<C>,
			requestContext: TGetAllRequestContext<C>,
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
		return <Context extends IRequestContext, Headers extends IHeaders>(
			headerSupplier: THeaderSupplier<Headers, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TMergeContextAdapters<Context, HeaderContext>,
					TMergeRecords<Context["value"], IRequestHeaders<Headers>>,
					Context["settings"],
					Context["accepts"]
				>,
				typeof headersMiddlewareSpecification
			>(
				() =>
					new HeadersMiddlewareFactory(
						() => new HeadersMiddleware(headerSupplier as THeaderSupplier),
					),
			);
		};
	}
}
