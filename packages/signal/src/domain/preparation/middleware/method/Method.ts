import { THttpMethod } from "@alette/pulse";
import { TIsExactlyLeft } from "@alette/shared";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { IRequestMethod } from "../../context/method/RequestMethod";
import { MethodMiddleware } from "./MethodMiddleware";
import { MethodMiddlewareFactory } from "./MethodMiddlewareFactory";
import { methodMiddlewareSpecification } from "./methodMiddlewareSpecification";

export type TMethodSupplier<
	C extends IRequestContext = IRequestContext,
	Method extends THttpMethod = THttpMethod,
> =
	| ((requestContext: TFullRequestContext<C>) => Method | Promise<Method>)
	| Method;

export class Method<
	InContext extends IRequestContext,
	HttpMethod extends THttpMethod,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, HttpMethod extends THttpMethod>(
		args: TMethodSupplier<_InContext, HttpMethod>,
	) => Method<_InContext, HttpMethod>,
	InContext,
	[
		IRequestContextPatch<{
			value: IRequestMethod<
				TIsExactlyLeft<THttpMethod, HttpMethod> extends true
					? "GET"
					: HttpMethod
			>;
		}>,
	],
	typeof methodMiddlewareSpecification
> {
	protected middlewareSpec = methodMiddlewareSpecification;

	constructor(protected override lastArgs: TMethodSupplier<any, any> = "GET") {
		super((args) => new Method(args));
	}

	getMiddleware() {
		return new MethodMiddlewareFactory(
			() => new MethodMiddleware(this.lastArgs),
		);
	}

	static toFactory<
		_InContext extends IRequestContext,
		HttpMethod extends THttpMethod,
	>(args: TMethodSupplier<_InContext, HttpMethod>) {
		return new Method()(args || "GET");
	}
}

export const method = /* @__PURE__ */ new Method();
