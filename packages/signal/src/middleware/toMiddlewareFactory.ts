import {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
} from "@alette/pulse";
import { VerifyMiddlewareCompatibility } from "@alette/pulse";
import { ApiRequest } from "../blueprint/ApiRequest";
import { IRequestContext } from "../context/IRequestContext";
import { ApiMiddleware } from "./ApiMiddleware";

export const toMiddlewareFactory =
	<
		Context extends IRequestContext,
		NextContext extends IRequestContext,
		MiddlewareSpec extends IAnyMiddlewareSpecification,
	>(
		middlewareSupplier: () => ApiMiddleware<any, any>,
	) =>
	/**
	 * Yet another ts degeneracy
	 * We need to "save" request constrain generic for validation,
	 * there's no other way to do that except this
	 * */
	<RequestConstraints extends IAnyRequestSpecification>(
		request: ApiRequest<any, Context, RequestConstraints>,
	) =>
	(
		/**
		 * Dirty hack, but there's no other way to trigger
		 * Ts type error for incompatible middleware
		 * */
		middleware: VerifyMiddlewareCompatibility<
			RequestConstraints,
			MiddlewareSpec,
			ApiMiddleware<NextContext, MiddlewareSpec>
		> = middlewareSupplier() as any,
	) =>
		middleware;
