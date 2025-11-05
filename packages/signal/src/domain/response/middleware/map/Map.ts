import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import {
	TFullRequestContext,
	TRequestResponse,
} from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { ResponseRef } from "../../adapter/ResponseRef";
import { MapMiddleware } from "./MapMiddleware";
import { MapMiddlewareFactory } from "./MapMiddlewareFactory";
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

export class Map<
	InContext extends IRequestContext,
	Mapped,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, Mapped>(
		args: TMapArgs<Mapped, _InContext>,
	) => Map<_InContext, Mapped>,
	InContext,
	[
		IRequestContextPatch<{
			types: IMappedResponseValue<Mapped>;
		}>,
	],
	typeof mapMiddlewareSpecification
> {
	protected middlewareSpec = mapMiddlewareSpecification;

	constructor(
		protected override lastArgs: TMapArgs<unknown, InContext> = (v) => v,
	) {
		super((args) => new Map(args));
	}

	getMiddleware() {
		return new MapMiddlewareFactory(
			() => new MapMiddleware(this.lastArgs as TMapArgs),
		);
	}
}

export const map = new Map();
