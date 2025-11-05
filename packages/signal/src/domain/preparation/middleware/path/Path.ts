import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { PathMiddleware } from "./PathMiddleware";
import { PathMiddlewareFactory } from "./PathMiddlewareFactory";
import { IRequestPath, TGetRequestPath } from "./RequestPath";
import { pathMiddlewareSpecification } from "./pathMiddlewareSpecification";

type TStrictPath = `/${string}`;

export type TPathMiddlewareArgs<
	NextPath extends TStrictPath = TStrictPath,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			context: TFullRequestContext<C>,
			prevPath: TGetRequestPath<C>,
	  ) => NextPath | Promise<NextPath>)
	| NextPath;

export class Path<
	InContext extends IRequestContext,
	PassedPath extends TStrictPath,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, PassedPath extends TStrictPath>(
		args: TPathMiddlewareArgs<PassedPath, _InContext>,
	) => Path<_InContext, PassedPath>,
	InContext,
	[
		IRequestContextPatch<{
			value: IRequestPath<PassedPath>;
		}>,
	],
	typeof pathMiddlewareSpecification
> {
	protected middlewareSpec = pathMiddlewareSpecification;

	constructor(protected override lastArgs: TPathMiddlewareArgs<any, any> = "") {
		super((args) => new Path(args));
	}

	getMiddleware() {
		return new PathMiddlewareFactory(() => new PathMiddleware(this.lastArgs));
	}
}

export const path = new Path();
