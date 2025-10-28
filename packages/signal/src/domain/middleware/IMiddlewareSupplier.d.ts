import { ApiRequest } from "../../application/blueprint";
import { IRequestContext } from "../context/IRequestContext";
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
	NextContext extends IRequestContext,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	RequestSpec extends IAnyRequestSpecification,
> extends MiddlewareFacade<
		any[],
		Context,
		NextContext,
		MiddlewareSpec,
		RequestSpec
	> {}

/**
 * 1. Represents actual middleware provider fns
 * we need to call in our code to get provided
 * middleware factories
 * */
export interface IRuntimeMiddlewareSupplierFn {
	(): () => RequestMiddleware<any, any>;
}
