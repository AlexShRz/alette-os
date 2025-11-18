import { IRequestContext } from "../context";
import { IRequestContextPatch } from "../context/RequestContextPatches";
import {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
	TVerifyMiddlewareCompatibility,
} from "../specification";
import { MiddlewareFacade } from "./MiddlewareFacade";

export type TAnyMiddlewareFacade<
	Context extends IRequestContext,
	OutContext extends IRequestContextPatch<any, any>[],
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	RequestSpec extends IAnyRequestSpecification,
> = MiddlewareFacade<
	any,
	Context,
	OutContext,
	/**
	 * 1. It's ok to have @ts-expect-error
	 * here. Without it, type level middleware + request
	 * specification validation will not work.
	 * 2. @ts-expect-error will not prevent TS from analyzing
	 * the type.
	 * */
	// @ts-expect-error
	TVerifyMiddlewareCompatibility<RequestSpec, MiddlewareSpec, MiddlewareSpec>
>;

/**
 * Same as above, just without middleware compatibility
 * verification
 * */
export type TAnyMiddlewareFacadeWithoutValidation<
	Context extends IRequestContext,
	OutContext extends IRequestContextPatch<any, any>[],
	MiddlewareSpec extends IAnyMiddlewareSpecification,
> = MiddlewareFacade<any, Context, OutContext, MiddlewareSpec>;
