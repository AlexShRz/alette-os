import { IHeaders } from "@alette/pulse";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import {
	IRequestHeaders,
	TGetRequestHeaders,
} from "../../context/headers/RequestHeaders";
import { HeadersMiddleware } from "./HeadersMiddleware";
import { HeadersMiddlewareFactory } from "./HeadersMiddlewareFactory";
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

export class Headers<
	InContext extends IRequestContext,
	PassedHeaders extends IHeaders,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, PassedHeaders extends IHeaders>(
		args: THeaderSupplier<PassedHeaders, _InContext>,
	) => Headers<_InContext, PassedHeaders>,
	InContext,
	[
		IRequestContextPatch<{
			value: IRequestHeaders<PassedHeaders>;
		}>,
	],
	typeof headersMiddlewareSpecification
> {
	protected middlewareSpec = headersMiddlewareSpecification;

	constructor(protected override lastArgs: THeaderSupplier = {}) {
		super((args) => new Headers(args as THeaderSupplier));
	}

	getMiddleware() {
		return new HeadersMiddlewareFactory(
			() => new HeadersMiddleware(this.lastArgs),
		);
	}
}

export const headers = /* @__PURE__ */ new Headers();
