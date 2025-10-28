import { THttpBody } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { TRequestBody } from "../../context/body/RequestBody";
import { TGetRequestHeaders } from "../../context/headers/RequestHeaders";
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
		return <Context extends IRequestContext, NewBody extends THttpBody>(
			bodySupplier: TBodySupplier<NewBody, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					TMergeRecords<
						Context["value"],
						TRequestBody<Context, NewBody, TGetRequestHeaders<Context>>
					>,
					Context["settings"],
					Context["accepts"],
					Context["acceptsMounted"]
				>,
				typeof bodyMiddlewareSpecification
			>(
				() =>
					new BodyMiddlewareFactory(
						() => new BodyMiddleware(bodySupplier as TBodySupplier),
					),
			);
		};
	}
}
