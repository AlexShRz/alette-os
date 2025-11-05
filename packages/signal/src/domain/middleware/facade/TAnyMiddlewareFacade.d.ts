import { IRequestContextPatch } from "../../context/RequestContextPatches";
import {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
	TVerifyMiddlewareSupplier,
} from "../../specification";
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
	InContext extends object,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContextPatches extends IRequestContextPatch<any, any>[],
	RequestSpec extends IAnyRequestSpecification = unknown,
> = (
	...args: any[]
) => TVerifyMiddlewareSupplier<
	RequestSpec,
	MiddlewareFacade<MiddlewareSpec, Arguments, OutContextPatches>
>;

type asdasd = TAnyMiddlewareFacade<string>;
