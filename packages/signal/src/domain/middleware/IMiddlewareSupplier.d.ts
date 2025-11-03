import { ApiRequest } from "../../application/blueprint";
import { IRequestContext } from "../context/IRequestContext";
import { IRequestContextPatch } from "../context/RequestContextPatches";
import {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
} from "../specification";
import { RequestMiddleware } from "./RequestMiddleware";
import { MiddlewareFacade } from "./facade/MiddlewareFacade";

/**
 * 1. An abstraction over more concrete middleware factories.
 * 2. Used mainly for typing methods that accept typed middleware.
 * */
// export interface IMiddlewareSupplier<
// 	Context extends IRequestContext,
// 	NextContext extends IRequestContext,
// 	MiddlewareSpec extends IAnyMiddlewareSpecification,
// 	RequestSpec extends IAnyRequestSpecification,
// > {
// 	(
// 		request: ApiRequest<any, Context, RequestSpec>,
// 	): (
// 		middleware: RequestMiddleware<NextContext, MiddlewareSpec>,
// 	) => typeof middleware;
// }

export interface IMiddlewareSupplier<
	Context extends IRequestContext,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	RequestSpec extends IAnyRequestSpecification,
	OutContext extends IRequestContextPatch<any, any>[],
> {
	(...args: any[]): MiddlewareFacade<Context, MiddlewareSpec, any, OutContext>;
}

/**
 * 1. Represents actual middleware provider fns
 * we need to call in our code to get provided
 * middleware factories
 * */
export interface IRuntimeMiddlewareSupplierFn {
	(): () => RequestMiddleware<any, any>;
}
