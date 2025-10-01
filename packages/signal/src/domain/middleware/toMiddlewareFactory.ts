import { ApiRequest } from "../../application/blueprint";
import { IRequestContext } from "../context/IRequestContext";
import type {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
	VerifyMiddlewareCompatibility,
} from "../specification";
import { RequestMiddleware } from "./RequestMiddleware";

export const toMiddlewareFactory =
	<
		Context extends IRequestContext,
		NextContext extends IRequestContext,
		MiddlewareSpec extends IAnyMiddlewareSpecification,
	>(
		middlewareSupplier: () => RequestMiddleware<any, any>,
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
			RequestMiddleware<NextContext, MiddlewareSpec>
		> = middlewareSupplier() as any,
	) =>
		middleware;
