import { IRequestContextPatch } from "../../context/RequestContextPatches";
import { IAnyMiddlewareSpecification } from "../../specification";
import { MiddlewareFacade } from "./MiddlewareFacade";

/**
 * README:
 * 1. This type acts as a "middleware matcher" and
 * used in middleware chaining.
 * 2. @ts-expect-error is used to allow TS to use IRequestContext
 * interchangeably with InContext and other generics here. This is
 * a hack, but at the moment I do not see a better solution.
 * */
export type TAnyMiddlewareFacade<
	Name extends string,
	InContext extends object,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContextPatches extends IRequestContextPatch<any, any>[],
> =
	| ((...args: any[]) => MiddlewareFacade<
			Name,
			// @ts-expect-error
			InContext,
			MiddlewareSpec,
			Arguments,
			OutContextPatches
	  >)
	/**
	 * Matches preconfigured + normal middleware.
	 * */
	// @ts-expect-error
	| MiddlewareFacade<
			Name,
			InContext,
			MiddlewareSpec,
			Arguments,
			OutContextPatches
	  >;
