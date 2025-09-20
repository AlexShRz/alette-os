import { THttpMethod } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { IRequestMethod } from "../../context/method/RequestMethod";
import { MethodMiddleware } from "./MethodMiddleware";
import { methodMiddlewareSpecification } from "./methodMiddlewareSpecification";

export type TMethodSupplier<
	Method extends THttpMethod = THttpMethod,
	C extends IRequestContext = IRequestContext,
> =
	| ((requestContext: TGetAllRequestContext<C>) => Method | Promise<Method>)
	| Method;

export class MethodMiddlewareFactory extends Middleware(
	"HeadersMiddlewareFactory",
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
			methodSupplier: TMethodSupplier<Method, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					TMergeRecords<Context["value"], IRequestMethod<Method>>,
					Context["settings"],
					Context["accepts"]
				>,
				typeof methodMiddlewareSpecification
			>(
				() =>
					new MethodMiddlewareFactory(
						() => new MethodMiddleware(methodSupplier as TMethodSupplier),
					),
			);
		};
	}
}
