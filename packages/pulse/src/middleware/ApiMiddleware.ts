import { IRequestContext } from "../IRequestContext";
import { MiddlewareConstraint } from "../constraints/MiddlewareConstraint";

export abstract class ApiMiddleware<
	Context extends IRequestContext = IRequestContext,
	Constraints extends MiddlewareConstraint[] = [],
> {}
