import { ApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import {
	TFullRequestContext,
	TRequestError,
} from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { MapErrorMiddleware } from "./MapErrorMiddleware";
import { IMappedErrorType } from "./MappedErrorType";
import { mapErrorMiddlewareSpecification } from "./mapErrorMiddlewareSpecification";

export type TMapErrorArgs<
	MappedError extends ApiError = ApiError,
	C extends IRequestContext = IRequestContext,
> = (
	requestError: TRequestError<C>,
	requestContext: TFullRequestContext<C>,
) => MappedError | Promise<MappedError>;

export class MapErrorMiddlewareFactory extends Middleware(
	"MapErrorMiddlewareFactory",
)(
	(getMiddleware: () => MapErrorMiddleware) =>
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
		return <InContext extends IRequestContext, MappedError extends ApiError>(
			args: TMapErrorArgs<MappedError, InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof mapErrorMiddlewareSpecification,
				TMapErrorArgs<MappedError, InContext>,
				[
					IRequestContextPatch<{
						types: IMappedErrorType<MappedError>;
					}>,
				]
			>({
				name: "mapError",
				lastArgs: args,
				middlewareSpec: mapErrorMiddlewareSpecification,
				middlewareFactory: (args) =>
					new MapErrorMiddlewareFactory(
						() => new MapErrorMiddleware(args as TMapErrorArgs),
					),
			});
		};
	}
}
