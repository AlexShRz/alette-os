import { ApiError } from "@alette/pulse";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import {
	TFullRequestContext,
	TRequestError,
} from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { MapErrorMiddleware } from "./MapErrorMiddleware";
import { MapErrorMiddlewareFactory } from "./MapErrorMiddlewareFactory";
import { IMappedErrorType } from "./MappedErrorType";
import { mapErrorMiddlewareSpecification } from "./mapErrorMiddlewareSpecification";

export type TMapErrorArgs<
	MappedError extends ApiError = ApiError,
	C extends IRequestContext = IRequestContext,
> = (
	requestError: TRequestError<C>,
	requestContext: TFullRequestContext<C>,
) => MappedError | Promise<MappedError>;

export class MapError<
	InContext extends IRequestContext,
	MappedError extends ApiError,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, MappedError extends ApiError>(
		args: TMapErrorArgs<MappedError, _InContext>,
	) => MapError<_InContext, MappedError>,
	InContext,
	[
		IRequestContextPatch<{
			types: IMappedErrorType<MappedError>;
		}>,
	],
	typeof mapErrorMiddlewareSpecification
> {
	protected middlewareSpec = mapErrorMiddlewareSpecification;

	constructor(
		protected override lastArgs: TMapErrorArgs<ApiError, InContext> = (v) =>
			v as ApiError,
	) {
		super((args) => new MapError(args));
	}

	getMiddleware() {
		return new MapErrorMiddlewareFactory(
			() => new MapErrorMiddleware(this.lastArgs as TMapErrorArgs),
		);
	}
}

export const mapError = new MapError();
