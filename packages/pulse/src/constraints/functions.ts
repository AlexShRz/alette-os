import { MiddlewareConstraint } from "./MiddlewareConstraint";
import { RequestConstraint } from "./RequestConstraint";

export const requestConstraint = RequestConstraint.toFactory;

export const middlewareConstraint = MiddlewareConstraint.toFactory;
