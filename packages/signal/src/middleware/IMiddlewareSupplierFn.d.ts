import {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
} from "@alette/pulse";
import { ApiRequest } from "../blueprint/ApiRequest";
import { IRequestContext } from "../context/IRequestContext";
import { ApiMiddleware } from "./ApiMiddleware";

/**
 * 1. An abstraction over more concrete middleware factories.
 * 2. Used mainly for typing methods that accept typed middleware.
 * */
export interface IMiddlewareSupplierFn<
	Context extends IRequestContext,
	NextContext extends IRequestContext,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	RequestSpec extends IAnyRequestSpecification,
> {
	(
		request: ApiRequest<any, Context, RequestSpec>,
	): (
		middleware: ApiMiddleware<NextContext, MiddlewareSpec>,
	) => typeof middleware;
}
