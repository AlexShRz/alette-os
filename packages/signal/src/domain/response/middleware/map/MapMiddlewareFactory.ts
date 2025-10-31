import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import {
	TFullRequestContext,
	TRequestResponse,
} from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
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
		return <InContext extends IRequestContext, Mapped>(
			args: TMapArgs<Mapped, InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof mapMiddlewareSpecification,
				TMapArgs<Mapped, InContext>,
				[
					IRequestContextPatch<{
						types: IMappedResponseValue<Mapped>;
					}>,
				]
			>({
				name: "map",
				lastArgs: args,
				middlewareSpec: mapMiddlewareSpecification,
				middlewareFactory: (args) =>
					new MapMiddlewareFactory(() => new MapMiddleware(args as TMapArgs)),
			});
		};
	}
}
