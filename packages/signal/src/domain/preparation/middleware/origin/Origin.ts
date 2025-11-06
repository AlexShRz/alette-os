import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { OriginMiddleware } from "./OriginMiddleware";
import { OriginMiddlewareFactory } from "./OriginMiddlewareFactory";
import { IRequestOrigin, TGetRequestOrigin } from "./RequestOrigin";
import { originMiddlewareSpecification } from "./originMiddlewareSpecification";

export type TOriginMiddlewareArgs<
	NewOrigin extends string = string,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			context: TFullRequestContext<C>,
			prevPath: TGetRequestOrigin<C>,
	  ) => NewOrigin | Promise<NewOrigin>)
	| NewOrigin;

export class Origin<
	InContext extends IRequestContext,
	PassedOrigin extends string,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, PassedOrigin extends string>(
		args?: TOriginMiddlewareArgs<PassedOrigin, _InContext>,
	) => Origin<_InContext, PassedOrigin>,
	InContext,
	[
		IRequestContextPatch<{
			value: IRequestOrigin<PassedOrigin>;
		}>,
	],
	typeof originMiddlewareSpecification
> {
	protected middlewareSpec = originMiddlewareSpecification;

	constructor(
		protected override lastArgs:
			| TOriginMiddlewareArgs<any, any>
			| undefined = undefined,
	) {
		super((args) => new Origin(args));
	}

	getMiddleware() {
		return new OriginMiddlewareFactory(
			() => new OriginMiddleware(this.lastArgs),
		);
	}
}

export const origin = /* @__PURE__ */ new Origin();
