import {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
} from "@alette/pulse";
import { ApiRequest } from "../../application/blueprint/ApiRequest";
import { IRequestContext } from "../context/IRequestContext";
import { RequestMiddleware } from "./RequestMiddleware";

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
		middleware: RequestMiddleware<NextContext, MiddlewareSpec>,
	) => typeof middleware;
}

/**
 * 1. Represents actual middleware provider fns
 * we need to call in our code to get provided
 * middleware factories
 * */
export interface IRuntimeMiddlewareSupplierFn {
	(): () => RequestMiddleware<any, any>;
}
