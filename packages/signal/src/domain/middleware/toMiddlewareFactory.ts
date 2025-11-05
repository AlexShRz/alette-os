import { ApiRequest } from "../../application/blueprint";
import { IRequestContext } from "../context/IRequestContext";
import { TApplyRequestContextPatches } from "../context/RequestContextPatches";
import type {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
	VerifyMiddlewareCompatibility,
} from "../specification";
import { RequestMiddleware } from "./RequestMiddleware";
import { MiddlewareFacade } from "./facade/MiddlewareFacade";

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
	<NextContextPatches>(
		/**
		 * Dirty hack, but there's no other way to trigger
		 * Ts type error for incompatible middleware
		 * */
		middleware: RequestMiddleware<
			NextContextPatches,
			MiddlewareSpec
		> = middlewareSupplier() as any,
	) =>
	(): VerifyMiddlewareCompatibility<
		RequestConstraints,
		MiddlewareSpec,
		RequestMiddleware<
			TApplyRequestContextPatches<Context, NextContextPatches>,
			MiddlewareSpec
		>
	> =>
		middleware;
