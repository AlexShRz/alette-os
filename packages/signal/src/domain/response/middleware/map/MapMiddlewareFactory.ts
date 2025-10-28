import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import {
	TFullRequestContext,
	TRequestResponse,
} from "../../../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { ResponseRef } from "../../adapter/ResponseRef";
import { MapMiddleware } from "./MapMiddleware";
import { IMappedResponseValue } from "./MappedResponseValue";
import { mapMiddlewareSpecification } from "./mapMiddlewareSpecification";

export type TMapArgs<
	Mapped = unknown,
	C extends IRequestContext = IRequestContext,
> = (
	response: TRequestResponse<C>,
	requestContext: TFullRequestContext<C>,
) =>
	| Mapped
	| Promise<Mapped>
	| ResponseRef<Mapped>
	| Promise<ResponseRef<Mapped>>;

export class MapMiddlewareFactory extends Middleware("MapMiddlewareFactory")(
	(getMiddleware: () => MapMiddleware) =>
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
		return <Context extends IRequestContext, Mapped>(
			args: TMapArgs<Mapped, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TMergeRecords<Context["types"], IMappedResponseValue<Mapped>>,
					Context["value"],
					Context["settings"],
					Context["accepts"],
					Context["acceptsMounted"]
				>,
				typeof mapMiddlewareSpecification
			>(
				() =>
					new MapMiddlewareFactory(() => new MapMiddleware(args as TMapArgs)),
			);
		};
	}
}
