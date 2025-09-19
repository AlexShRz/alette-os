import { IHeaders } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeContextAdapters } from "../../../context/typeUtils/TMergeContextAdapters";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { HeaderContext } from "../../HeaderContext";
import { IRequestHeaders, THeaderSupplier } from "../../RequestHeaders";
import { HeadersMiddleware } from "./HeadersMiddleware";
import { headersMiddlewareSpecification } from "./headersMiddlewareSpecification";

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
					TMergeRecords<
						Context["value"],
						IRequestHeaders<Context, Headers, typeof headerSupplier>
					>,
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
