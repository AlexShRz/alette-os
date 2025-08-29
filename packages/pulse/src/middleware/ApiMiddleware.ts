import { IRequestContext } from "../IRequestContext";
import { MiddlewareConstraint } from "../constraints/MiddlewareConstraint";

export abstract class RequestMiddleware<
	Context extends IRequestContext = IRequestContext,
	Constraints extends MiddlewareConstraint[] = [],
> {}
